/**
 * TipManager handles loading, filtering, randomizing, searching tips,
 * anti-repetition cycles, fetching live tips from online APIs,
 * and translating foreign online tips automatically into Vietnamese.
 */

class TipManager {
  constructor() {
    this.builtinTips = [];
    this.customTips = [];
    this.cachedOnlineTips = [];
    this.allTips = [];
    this.currentTip = null;
    this.viewedTipIds = [];
    this.isFetchingOnline = false;
  }

  async loadTips() {
    // 1. Load builtin static tips
    try {
      const response = await fetch('./data/tips.json');
      if (response.ok) {
        this.builtinTips = await response.json();
      }
    } catch (e) {
      console.error('Failed to load builtin tips:', e);
      this.builtinTips = [];
    }

    // 2. Load custom tips & cached online tips from storage
    this.customTips = await window.StorageService.getCustomTips();
    this.cachedOnlineTips = await window.StorageService.getCachedOnlineTips();
    this.viewedTipIds = await window.StorageService.getViewedTipIds();

    // 3. Migrate and translate any old cached online tips that were in English
    this.migrateCachedTipsToVietnamese();

    this.refreshAllTips();
    return this.allTips;
  }

  /**
   * Translates existing cached online tips if they are in English
   */
  async migrateCachedTipsToVietnamese() {
    let updated = false;
    for (let i = 0; i < this.cachedOnlineTips.length; i++) {
      const tip = this.cachedOnlineTips[i];
      if (tip && tip.isOnline && this.isEnglishText(tip.content)) {
        try {
          const viText = await this.translateToVietnamese(tip.content);
          if (viText && viText !== tip.content) {
            tip.content = viText;
            tip.title = this.generateTitleFromAdvice(viText);
            updated = true;
          }
        } catch (e) {
          // Ignore migration errors
        }
      }
    }

    if (updated) {
      await window.StorageService.saveCachedOnlineTips(this.cachedOnlineTips);
      this.refreshAllTips();
    }
  }

  isEnglishText(text) {
    if (!text) return false;
    // Check if text lacks Vietnamese specific diacritics
    const hasVietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    return !hasVietnameseChars;
  }

  decodeHtmlEntities(text) {
    if (!text) return '';
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  }

  /**
   * Automatic translation to Vietnamese with multi-layer fallback
   */
  async translateToVietnamese(text) {
    if (!text || !text.trim()) return text;
    if (!this.isEnglishText(text)) return text; // Already in Vietnamese

    // Strategy 1: MyMemory Translation API
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
          const translated = this.decodeHtmlEntities(data.responseData.translatedText.trim());
          if (translated && !translated.includes('MYMEMORY WARNING') && !translated.includes('QUERY LENGTH LIMIT')) {
            return translated;
          }
        }
      }
    } catch (e) {
      console.warn('MyMemory API error, trying fallback:', e);
    }

    // Strategy 2: Google Translate Client Endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0] && Array.isArray(data[0])) {
          const translated = data[0].map(item => item[0]).filter(Boolean).join('');
          if (translated) return this.decodeHtmlEntities(translated.trim());
        }
      }
    } catch (e) {
      console.warn('Google Translate API error:', e);
    }

    return text;
  }

  refreshAllTips() {
    // Custom tips first, then online cached tips, then builtin tips
    // Remove duplicates by ID
    const map = new Map();
    [...this.customTips, ...this.cachedOnlineTips, ...this.builtinTips].forEach(tip => {
      if (tip && tip.id && !map.has(tip.id)) {
        map.set(tip.id, tip);
      }
    });
    this.allTips = Array.from(map.values());
  }

  setCustomTips(customTips) {
    this.customTips = customTips;
    this.refreshAllTips();
  }

  /**
   * Filter tips by active categories in settings
   */
  getFilteredTips(selectedCategories = null, categoryFilter = null) {
    let pool = this.allTips;

    if (categoryFilter && categoryFilter !== 'all') {
      pool = pool.filter(tip => tip.category === categoryFilter);
    } else if (selectedCategories && Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      pool = pool.filter(tip => selectedCategories.includes(tip.category));
    }

    return pool.length > 0 ? pool : this.allTips;
  }

  /**
   * Anti-repetition Random Tip selector:
   * Only picks tips that haven't been seen in the current cycle.
   * Resets cycle once all tips in candidate pool have been viewed.
   */
  async getRandomTip(selectedCategories = null, categoryFilter = null, allowOnlineFetch = true) {
    const candidates = this.getFilteredTips(selectedCategories, categoryFilter);
    if (!candidates || candidates.length === 0) return null;

    // Filter out already viewed tips in this cycle
    let unviewed = candidates.filter(t => !this.viewedTipIds.includes(t.id));

    // If all tips in this pool have been viewed, reset the viewed cycle for these candidates!
    if (unviewed.length === 0) {
      const candidateIds = candidates.map(t => t.id);
      this.viewedTipIds = this.viewedTipIds.filter(id => !candidateIds.includes(id));
      unviewed = candidates.filter(t => !this.currentTip || t.id !== this.currentTip.id);
      if (unviewed.length === 0) unviewed = candidates;
    }

    // Pick random unviewed
    const randomIndex = Math.floor(Math.random() * unviewed.length);
    this.currentTip = unviewed[randomIndex];

    // Record as viewed
    if (this.currentTip && !this.viewedTipIds.includes(this.currentTip.id)) {
      this.viewedTipIds.push(this.currentTip.id);
      if (this.viewedTipIds.length > 500) {
        this.viewedTipIds = this.viewedTipIds.slice(-250);
      }
      await window.StorageService.saveViewedTipIds(this.viewedTipIds);
    }

    // Background fetch fresh online tips if enabled to keep library growing
    if (allowOnlineFetch && navigator.onLine) {
      this.backgroundFetchFreshOnlineTip(categoryFilter);
    }

    return this.currentTip;
  }

  /**
   * Fetch a fresh tip live from public online APIs and translate to Vietnamese
   */
  async fetchLiveOnlineTip(categoryFilter = null) {
    if (!navigator.onLine) return null;

    try {
      this.isFetchingOnline = true;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      // Fetch advice from online API
      const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      if (!data || !data.slip || !data.slip.advice) return null;

      const rawEnglishAdvice = data.slip.advice;
      const slipId = `online_advice_${data.slip.id}`;

      // Check if already in library
      const existing = this.allTips.find(t => t.id === slipId);
      if (existing) {
        this.isFetchingOnline = false;
        return existing;
      }

      // Automatically translate to Vietnamese!
      const vietnameseAdvice = await this.translateToVietnamese(rawEnglishAdvice);

      // Map to category & format
      const category = categoryFilter && categoryFilter !== 'all' ? categoryFilter : this.detectCategory(rawEnglishAdvice + ' ' + vietnameseAdvice);
      const catNames = {
        productivity: '⚡ Năng suất',
        '5s': '🧹 5S Văn Phòng',
        safety: '🦺 An Toàn Lao Động',
        tech: '💻 Công nghệ',
        health: '🧘 Sức khỏe',
        finance: '💰 Tài chính',
        life: '🏠 Đời sống',
        mindset: '🧠 Tâm lý & Tư duy'
      };

      const newOnlineTip = {
        id: slipId,
        category: category,
        categoryName: catNames[category] || '🌐 Trực tuyến',
        title: this.generateTitleFromAdvice(vietnameseAdvice),
        content: vietnameseAdvice,
        action: `👉 Lời khuyên áp dụng: Hãy ghi nhớ và thực hành điều này trong các quyết định tiếp theo của bạn.`,
        tags: ['#online', '#meovat', `#${category}`],
        isOnline: true,
        fetchedAt: new Date().toISOString()
      };

      // Add to cached online tips
      this.cachedOnlineTips = [newOnlineTip, ...this.cachedOnlineTips].slice(0, 150); // Keep last 150
      await window.StorageService.saveCachedOnlineTips(this.cachedOnlineTips);
      this.refreshAllTips();

      this.currentTip = newOnlineTip;
      if (!this.viewedTipIds.includes(newOnlineTip.id)) {
        this.viewedTipIds.push(newOnlineTip.id);
        await window.StorageService.saveViewedTipIds(this.viewedTipIds);
      }

      this.isFetchingOnline = false;
      return newOnlineTip;
    } catch (e) {
      console.warn('Online tip fetch failed/timed out, falling back to local pool:', e);
      this.isFetchingOnline = false;
      return null;
    }
  }

  /**
   * Background fetch to silently enrich the library with translated Vietnamese tips
   */
  async backgroundFetchFreshOnlineTip(categoryFilter = null) {
    if (this.isFetchingOnline || !navigator.onLine) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.slip && data.slip.advice) {
          const slipId = `online_advice_${data.slip.id}`;
          if (!this.allTips.some(t => t.id === slipId)) {
            const rawEnglish = data.slip.advice;
            const vietnameseAdvice = await this.translateToVietnamese(rawEnglish);
            const category = categoryFilter && categoryFilter !== 'all' ? categoryFilter : this.detectCategory(rawEnglish + ' ' + vietnameseAdvice);
            const catNames = {
              productivity: '⚡ Năng suất',
              '5s': '🧹 5S Văn Phòng',
              safety: '🦺 An Toàn Lao Động',
              tech: '💻 Công nghệ',
              health: '🧘 Sức khỏe',
              finance: '💰 Tài chính',
              life: '🏠 Đời sống',
              mindset: '🧠 Tâm lý & Tư duy'
            };
            const tip = {
              id: slipId,
              category,
              categoryName: catNames[category] || '🌐 Trực tuyến',
              title: this.generateTitleFromAdvice(vietnameseAdvice),
              content: vietnameseAdvice,
              action: `👉 Lời khuyên áp dụng: Hãy ghi nhớ và ứng dụng vào cuộc sống của bạn.`,
              tags: ['#online', '#meovat', `#${category}`],
              isOnline: true,
              fetchedAt: new Date().toISOString()
            };
            this.cachedOnlineTips.unshift(tip);
            if (this.cachedOnlineTips.length > 150) this.cachedOnlineTips.pop();
            await window.StorageService.saveCachedOnlineTips(this.cachedOnlineTips);
            this.refreshAllTips();
          }
        }
      }
    } catch (e) {
      // Ignore background errors
    }
  }

  /**
   * Helper to detect category from text
   */
  detectCategory(text) {
    const lower = text.toLowerCase();
    if (lower.includes('5s') || lower.includes('sàng lọc') || lower.includes('sắp xếp') || lower.includes('sạch sẽ') || lower.includes('săn sóc') || lower.includes('sẵn sàng') || lower.includes('tủ hồ sơ') || lower.includes('bàn làm việc')) {
      return '5s';
    }
    if (lower.includes('an toàn') || lower.includes('bảo hộ') || lower.includes('ppe') || lower.includes('nguy cơ') || lower.includes('máy móc') || lower.includes('cháy nổ') || lower.includes('điện') || lower.includes('thoát hiểm')) {
      return 'safety';
    }
    if (lower.includes('work') || lower.includes('time') || lower.includes('plan') || lower.includes('goal') || lower.includes('focus') || lower.includes('task') || lower.includes('công việc') || lower.includes('thời gian') || lower.includes('mục tiêu') || lower.includes('làm việc')) {
      return 'productivity';
    }
    if (lower.includes('sleep') || lower.includes('eat') || lower.includes('health') || lower.includes('water') || lower.includes('body') || lower.includes('walk') || lower.includes('sức khỏe') || lower.includes('ngủ') || lower.includes('ăn') || lower.includes('uống')) {
      return 'health';
    }
    if (lower.includes('money') || lower.includes('save') || lower.includes('buy') || lower.includes('spend') || lower.includes('cost') || lower.includes('pay') || lower.includes('tiền') || lower.includes('tiết kiệm') || lower.includes('mua') || lower.includes('chi tiêu')) {
      return 'finance';
    }
    if (lower.includes('computer') || lower.includes('phone') || lower.includes('app') || lower.includes('code') || lower.includes('click') || lower.includes('screen') || lower.includes('máy tính') || lower.includes('phần mềm') || lower.includes('điện thoại') || lower.includes('mạng')) {
      return 'tech';
    }
    if (lower.includes('think') || lower.includes('feel') || lower.includes('mind') || lower.includes('worry') || lower.includes('people') || lower.includes('learn') || lower.includes('suy nghĩ') || lower.includes('tâm lý') || lower.includes('cảm xúc') || lower.includes('học hỏi') || lower.includes('bạn bè') || lower.includes('tình cảm')) {
      return 'mindset';
    }
    return 'life';
  }

  generateTitleFromAdvice(advice) {
    if (!advice) return 'Lời khuyên hữu ích';
    if (advice.length <= 45) return advice;
    const words = advice.split(' ');
    if (words.length <= 8) return advice;
    return words.slice(0, 7).join(' ') + '...';
  }

  /**
   * Get tip of the day (deterministic based on date)
   */
  getDailyTip(selectedCategories = null) {
    const candidates = this.getFilteredTips(selectedCategories);
    if (!candidates || candidates.length === 0) return null;

    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % candidates.length;
    this.currentTip = candidates[index];
    return this.currentTip;
  }

  getTipById(id) {
    return this.allTips.find(t => t.id === id) || null;
  }

  searchTips(query, tipsList = this.allTips) {
    if (!query || !query.trim()) return tipsList;
    const q = query.toLowerCase().trim();
    return tipsList.filter(t => {
      const matchTitle = t.title && t.title.toLowerCase().includes(q);
      const matchContent = t.content && t.content.toLowerCase().includes(q);
      const matchAction = t.action && t.action.toLowerCase().includes(q);
      const matchTags = t.tags && t.tags.some(tag => tag.toLowerCase().includes(q));
      const matchCat = t.categoryName && t.categoryName.toLowerCase().includes(q);
      return matchTitle || matchContent || matchAction || matchTags || matchCat;
    });
  }
}

window.TipManager = TipManager;
