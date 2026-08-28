/**
 * Life Hacks New Tab - Main Application Logic
 * Supports online live tip fetching, anti-repetition cycles, custom tips, and theme customization.
 */

(function () {
  'use strict';

  // Core Instances
  const tipManager = new window.TipManager();
  let currentSettings = { ...window.DEFAULT_SETTINGS };
  let favoriteIds = [];
  let currentCategoryFilter = 'all';
  let isSpeaking = false;
  let activeDrawerTab = 'saved';

  // Search Engine URLs
  const SEARCH_ENGINES = {
    google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: '🔎' },
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: '🦆' },
    brave: { name: 'Brave', url: 'https://search.brave.com/search?q=', icon: '🦁' },
    ecosia: { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=', icon: '🌱' },
    youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: '▶️' }
  };

  // DOM Elements
  const elements = {
    body: document.body,
    // Clock & Greeting
    clockWidget: document.getElementById('clockWidget'),
    timeDisplay: document.getElementById('timeDisplay'),
    dateDisplay: document.getElementById('dateDisplay'),
    greetingDisplay: document.getElementById('greetingDisplay'),
    
    // Header Actions
    btnAddCustomTipTop: document.getElementById('btnAddCustomTipTop'),
    btnOpenFavorites: document.getElementById('btnOpenFavorites'),
    favCountBadge: document.getElementById('favCountBadge'),
    btnOpenSettings: document.getElementById('btnOpenSettings'),

    // Search
    searchWidget: document.getElementById('searchWidget'),
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    currentEngineIcon: document.getElementById('currentEngineIcon'),

    // Category Filter Chips
    categoryChipsBar: document.getElementById('categoryChipsBar'),

    // Tip Card
    tipCard: document.getElementById('tipCard'),
    tipCategoryBadge: document.getElementById('tipCategoryBadge'),
    tipModeBadge: document.getElementById('tipModeBadge'),
    tipOnlineBadge: document.getElementById('tipOnlineBadge'),
    tipTitle: document.getElementById('tipTitle'),
    tipContent: document.getElementById('tipContent'),
    tipActionBox: document.getElementById('tipActionBox'),
    tipActionText: document.getElementById('tipActionText'),
    tipTagsRow: document.getElementById('tipTagsRow'),
    btnNextTip: document.getElementById('btnNextTip'),
    btnFavTip: document.getElementById('btnFavTip'),
    favHeartIcon: document.getElementById('favHeartIcon'),
    favBtnLabel: document.getElementById('favBtnLabel'),
    btnCopyTip: document.getElementById('btnCopyTip'),
    btnSpeakTip: document.getElementById('btnSpeakTip'),
    btnShareTip: document.getElementById('btnShareTip'),

    // Shortcuts
    shortcutsSection: document.getElementById('shortcutsSection'),
    shortcutsGrid: document.getElementById('shortcutsGrid'),

    // Footer
    appFooter: document.getElementById('appFooter'),
    shortcutHelperPill: document.getElementById('shortcutHelperPill'),

    // Favorites Drawer
    favDrawerOverlay: document.getElementById('favDrawerOverlay'),
    favDrawer: document.getElementById('favDrawer'),
    btnCloseFavDrawer: document.getElementById('btnCloseFavDrawer'),
    tabSavedTips: document.getElementById('tabSavedTips'),
    tabCustomTips: document.getElementById('tabCustomTips'),
    savedCountSpan: document.getElementById('savedCountSpan'),
    customCountSpan: document.getElementById('customCountSpan'),
    favSearchInput: document.getElementById('favSearchInput'),
    btnOpenCreateModal: document.getElementById('btnOpenCreateModal'),
    btnExportTips: document.getElementById('btnExportTips'),
    importFileInput: document.getElementById('importFileInput'),
    drawerListContainer: document.getElementById('drawerListContainer'),

    // Custom Tip Modal
    customTipModal: document.getElementById('customTipModal'),
    btnCloseCustomModal: document.getElementById('btnCloseCustomModal'),
    btnCancelCustom: document.getElementById('btnCancelCustom'),
    customTipForm: document.getElementById('customTipForm'),
    customTitle: document.getElementById('customTitle'),
    customCategory: document.getElementById('customCategory'),
    customTags: document.getElementById('customTags'),
    customContent: document.getElementById('customContent'),
    customAction: document.getElementById('customAction'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    btnSaveSettingsModal: document.getElementById('btnSaveSettingsModal'),
    settingSearchEngine: document.getElementById('settingSearchEngine'),
    settingVersionBadge: document.getElementById('settingVersionBadge'),
    settingVersionTime: document.getElementById('settingVersionTime'),
    toggleAutoOnline: document.getElementById('toggleAutoOnline'),
    toggleClock: document.getElementById('toggleClock'),
    toggleSearch: document.getElementById('toggleSearch'),
    toggleShortcuts: document.getElementById('toggleShortcuts'),
    toggleShortcutHint: document.getElementById('toggleShortcutHint'),
    togglePomodoro: document.getElementById('togglePomodoro'),
    toggleTodoList: document.getElementById('toggleTodoList'),
    btnResetSettings: document.getElementById('btnResetSettings'),

    // Pomodoro Widget
    pomoHeaderWidget: document.getElementById('pomoHeaderWidget'),
    btnPomoToggle: document.getElementById('btnPomoToggle'),
    pomoIcon: document.getElementById('pomoIcon'),
    pomoTimerDisplay: document.getElementById('pomoTimerDisplay'),
    pomoPillCount: document.getElementById('pomoPillCount'),
    pomoPopupCard: document.getElementById('pomoPopupCard'),
    btnClosePomoCard: document.getElementById('btnClosePomoCard'),
    pomoTimerBig: document.getElementById('pomoTimerBig'),
    pomoStatusLabel: document.getElementById('pomoStatusLabel'),
    pomoSuccessCount: document.getElementById('pomoSuccessCount'),
    pomoCounterBadge: document.getElementById('pomoCounterBadge'),
    pomoBreakOverlay: document.getElementById('pomoBreakOverlay'),
    btnApplyCustomBreak: document.getElementById('btnApplyCustomBreak'),
    customBreakInput: document.getElementById('customBreakInput'),
    btnSkipBreak: document.getElementById('btnSkipBreak'),
    btnPomoStartPause: document.getElementById('btnPomoStartPause'),
    btnPomoReset: document.getElementById('btnPomoReset'),

    // To-Do List Widget
    todoWidgetPanel: document.getElementById('todoWidgetPanel'),
    btnToggleTodoPanel: document.getElementById('btnToggleTodoPanel'),
    todoMainBadge: document.getElementById('todoMainBadge'),
    todoCardBody: document.getElementById('todoCardBody'),
    btnMinimizeTodo: document.getElementById('btnMinimizeTodo'),
    tabTodoActive: document.getElementById('tabTodoActive'),
    tabTodoCompleted: document.getElementById('tabTodoCompleted'),
    todoActiveCount: document.getElementById('todoActiveCount'),
    todoCompletedCount: document.getElementById('todoCompletedCount'),
    btnTypeSingle: document.getElementById('btnTypeSingle'),
    btnTypeRecurring: document.getElementById('btnTypeRecurring'),
    btnTypeMonthly: document.getElementById('btnTypeMonthly'),
    todoInputForm: document.getElementById('todoInputForm'),
    todoInputText: document.getElementById('todoInputText'),
    todoSubSingle: document.getElementById('todoSubSingle'),
    todoSubRecurring: document.getElementById('todoSubRecurring'),
    todoSubMonthly: document.getElementById('todoSubMonthly'),
    todoInputDate: document.getElementById('todoInputDate'),
    todoInputTime: document.getElementById('todoInputTime'),
    todoRecurTime: document.getElementById('todoRecurTime'),
    todoMonthlyTime: document.getElementById('todoMonthlyTime'),
    todoMonthlyDay: document.getElementById('todoMonthlyDay'),
    weekdayPicker: document.getElementById('weekdayPicker'),
    todoInputEstDuration: document.getElementById('todoInputEstDuration'),
    todoActiveList: document.getElementById('todoActiveList'),
    todoCompletedList: document.getElementById('todoCompletedList'),
    btnClearCompleted: document.getElementById('btnClearCompleted'),
    todoFormContainer: document.getElementById('todoFormContainer'),
    btnExpandTaskView: document.getElementById('btnExpandTaskView'),

    // Task Alarm Center Screen Popup
    taskAlarmModal: document.getElementById('taskAlarmModal'),
    alarmTaskTitle: document.getElementById('alarmTaskTitle'),
    alarmTaskEst: document.getElementById('alarmTaskEst'),
    alarmTaskDeadline: document.getElementById('alarmTaskDeadline'),
    btnAlarmStart: document.getElementById('btnAlarmStart'),
    btnAlarmSnooze: document.getElementById('btnAlarmSnooze'),
    btnAlarmClose: document.getElementById('btnAlarmClose'),

    // Fullscreen Windows Task View Overlay
    taskViewOverlay: document.getElementById('taskViewOverlay'),
    btnTaskViewClose: document.getElementById('btnTaskViewClose'),
    tvCountUrgent: document.getElementById('tvCountUrgent'),
    tvListUrgent: document.getElementById('tvListUrgent'),
    tvCountToday: document.getElementById('tvCountToday'),
    tvListToday: document.getElementById('tvListToday'),
    tvCountUpcoming: document.getElementById('tvCountUpcoming'),
    tvListUpcoming: document.getElementById('tvListUpcoming'),
    tvCountCompleted: document.getElementById('tvCountCompleted'),
    tvListCompleted: document.getElementById('tvListCompleted'),

    // 24-Hour Sandwich Timeline Plate
    btnOpenSandwichPlate: document.getElementById('btnOpenSandwichPlate'),
    sandwichPlateOverlay: document.getElementById('sandwichPlateOverlay'),
    btnPlateClose: document.getElementById('btnPlateClose'),
    btnQuickAddSandwichTask: document.getElementById('btnQuickAddSandwichTask'),
    btnAutoFixConflicts: document.getElementById('btnAutoFixConflicts'),
    sandwichConflictBanner: document.getElementById('sandwichConflictBanner'),
    sandwichConflictText: document.getElementById('sandwichConflictText'),
    timelineRuler: document.getElementById('timelineRuler'),
    timelineTrackContainer: document.getElementById('timelineTrackContainer'),
    timelineTrack: document.getElementById('timelineTrack'),
    timelineNowLine: document.getElementById('timelineNowLine'),
    unscheduledSlicesList: document.getElementById('unscheduledSlicesList'),

    // Daily Work Efficiency Card
    dailyEfficiencyCard: document.getElementById('dailyEfficiencyCard'),
    efficiencyTitle: document.getElementById('efficiencyTitle'),
    efficiencyDate: document.getElementById('efficiencyDate'),
    efficiencyActualTime: document.getElementById('efficiencyActualTime'),
    efficiencyBadge: document.getElementById('efficiencyBadge'),
    efficiencyProgressFill: document.getElementById('efficiencyProgressFill'),

    // Top Right Active Task Floating Banner Widget
    activeTaskWidget: document.getElementById('activeTaskWidget'),
    activeTaskTitle: document.getElementById('activeTaskTitle'),
    activeTaskTimer: document.getElementById('activeTaskTimer'),
    activeTaskStatusIcon: document.getElementById('activeTaskStatusIcon'),
    btnActiveTaskPause: document.getElementById('btnActiveTaskPause'),
    btnActiveTaskDone: document.getElementById('btnActiveTaskDone'),

    // Shortcut Modal
    shortcutModal: document.getElementById('shortcutModal'),
    btnCloseShortcutModal: document.getElementById('btnCloseShortcutModal'),
    btnCancelShortcut: document.getElementById('btnCancelShortcut'),
    shortcutForm: document.getElementById('shortcutForm'),
    shortcutTitle: document.getElementById('shortcutTitle'),
    shortcutUrl: document.getElementById('shortcutUrl'),
    shortcutIcon: document.getElementById('shortcutIcon'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  /* ==========================================================================
     Initialization & Lifecycle
     ========================================================================== */

  async function init() {
    // 1. Load settings & favorites
    currentSettings = await window.StorageService.getSettings();
    favoriteIds = await window.StorageService.getFavorites();

    // 2. Apply theme & UI toggles
    applyTheme(currentSettings.theme);
    applyWidgetVisibility();

    // 3. Setup Clock & Greetings
    startClock();

    // 4. Initialize Widgets (Pomodoro & To-Do List)
    await initPomodoro();
    await initTodoList();

    // 5. Load Tips Dataset
    await tipManager.loadTips();

    // 6. Render Initial Tip (with Anti-repetition & Online Fetch)
    await displayInitialTip();

    // 7. Render UI Components
    updateFavoritesBadge();
    renderShortcuts();
    setupSearchEngineDisplay();
    bindEvents();
    bindKeyboardShortcuts();
  }

  /* ==========================================================================
     Theme & Display
     ========================================================================== */

  function applyTheme(themeName) {
    elements.body.className = '';
    elements.body.classList.add(`theme-${themeName}`);
    
    // Highlight theme button in settings
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
  }

  function applyWidgetVisibility() {
    if (elements.clockWidget) elements.clockWidget.style.display = currentSettings.showClock ? 'flex' : 'none';
    if (elements.searchWidget) elements.searchWidget.style.display = currentSettings.showSearch ? 'block' : 'none';
    if (elements.shortcutsSection) elements.shortcutsSection.style.display = currentSettings.showShortcuts ? 'block' : 'none';
    if (elements.shortcutHelperPill) elements.shortcutHelperPill.style.display = currentSettings.showShortcutsHint ? 'flex' : 'none';
    if (elements.pomoHeaderWidget) elements.pomoHeaderWidget.style.display = currentSettings.showPomodoro ? 'block' : 'none';
    if (elements.todoWidgetPanel) elements.todoWidgetPanel.style.display = currentSettings.showTodoList ? 'block' : 'none';
  }

  /* ==========================================================================
     Clock & Greeting
     ========================================================================== */

  function getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }

  function playReminderChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {}
  }

  function triggerChromeNotification(title, message) {
    try {
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: title,
          message: message,
          priority: 2
        });
      }
    } catch(e) {}
  }

  let lastCheckedMinuteStr = '';

  function checkTaskReminders() {
    if (!todoList || todoList.length === 0) return;
    const now = new Date();
    const todayStr = getTodayStr();
    const hoursStr = String(now.getHours()).padStart(2, '0');
    const minsStr = String(now.getMinutes()).padStart(2, '0');
    const currentMinuteStr = `${todayStr} ${hoursStr}:${minsStr}`;

    if (currentMinuteStr === lastCheckedMinuteStr) return;
    lastCheckedMinuteStr = currentMinuteStr;

    let hasChanges = false;
    todoList.forEach(todo => {
      if (todo.completed) return;

      if (todo.isMonthly && todo.repeatMonthDay) {
        const currentDayOfMonth = now.getDate();
        if (currentDayOfMonth === todo.repeatMonthDay) {
          if (todo.dueTime && todo.dueTime === `${hoursStr}:${minsStr}`) {
            if (todo.lastNotifiedMinute !== currentMinuteStr) {
              todo.lastNotifiedMinute = currentMinuteStr;
              hasChanges = true;
              playReminderChime();
              showToast(`📆 Task lặp tháng: ${todo.text} (${todo.dueTime})`, '🔔');
              triggerChromeNotification('📆 Nhắc hẹn task lặp tháng', `${todo.text} (${todo.dueTime})`);
            }
          }
        }
      } else if (todo.isRecurring) {
        const currentDay = now.getDay();
        if (Array.isArray(todo.repeatDays) && todo.repeatDays.includes(currentDay)) {
          if (todo.dueTime && todo.dueTime === `${hoursStr}:${minsStr}`) {
            if (todo.lastNotifiedMinute !== currentMinuteStr) {
              todo.lastNotifiedMinute = currentMinuteStr;
              hasChanges = true;
              playReminderChime();
              showToast(`🔁 Task lặp tuần: ${todo.text} (${todo.dueTime})`, '🔔');
              triggerChromeNotification('🔁 Nhắc hẹn task lặp tuần', `${todo.text} (${todo.dueTime})`);
            }
          }
        }
      } else if (todo.dueDate && todo.dueTime) {
        const todoTargetStr = `${todo.dueDate} ${todo.dueTime}`;
        if (todoTargetStr === `${todayStr} ${hoursStr}:${minsStr}`) {
          if (todo.lastNotifiedMinute !== currentMinuteStr) {
            todo.lastNotifiedMinute = currentMinuteStr;
            hasChanges = true;
            playReminderChime();
            showToast(`⏰ Hẹn giờ: ${todo.text} (${todo.dueTime})`, '🔔');
            triggerChromeNotification('⏰ Nhắc hẹn công việc', `${todo.text} - ${todo.dueTime}`);
          }
        }
      }
    });

    if (hasChanges) {
      window.StorageService.saveTodoList(todoList);
    }
  }

  function startClock() {
    function update() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      elements.timeDisplay.textContent = `${hours}:${minutes}`;

      // Date in Vietnamese
      const daysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = daysVi[now.getDay()];
      const dateNum = now.getDate();
      const monthNum = now.getMonth() + 1;
      const yearNum = now.getFullYear();
      elements.dateDisplay.textContent = `${dayName}, ${dateNum}/${monthNum}/${yearNum}`;

      // Greeting based on time of day
      const currentHour = now.getHours();
      let greeting = 'Chào bạn! ✨';
      if (currentHour >= 5 && currentHour < 12) {
        greeting = 'Chào buổi sáng, chúc bạn ngày mới tràn đầy năng lượng! ☀️';
      } else if (currentHour >= 12 && currentHour < 14) {
        greeting = 'Chúc bạn bữa trưa ngon miệng và nghỉ ngơi tốt! 🍱';
      } else if (currentHour >= 14 && currentHour < 18) {
        greeting = 'Chào buổi chiều, tập trung hoàn thành mục tiêu nhé! 🚀';
      } else if (currentHour >= 18 && currentHour < 22) {
        greeting = 'Chào buổi tối, thư giãn và chăm sóc bản thân nào! 🌙';
      } else {
        greeting = 'Đêm đã khuya rồi, đừng quên ngủ sớm để giữ gìn sức khỏe nhé! 💤';
      }
      elements.greetingDisplay.textContent = greeting;

      // Check task reminders
      checkTaskReminders();
    }

    update();
    setInterval(update, 1000);
  }

  /* ==========================================================================
     Tip Rendering & Anti-Repetition Management
     ========================================================================== */

  async function displayInitialTip() {
    let tip = null;
    if (currentSettings.tipMode === 'daily') {
      tip = tipManager.getDailyTip(currentSettings.selectedCategories);
    } else {
      // If autoFetchOnline is enabled and random chance triggers, try online or anti-repetition random
      if (currentSettings.autoFetchOnline && Math.random() < 0.35 && navigator.onLine) {
        tip = await tipManager.fetchLiveOnlineTip(currentCategoryFilter);
      }
      if (!tip) {
        tip = await tipManager.getRandomTip(currentSettings.selectedCategories, currentCategoryFilter, currentSettings.autoFetchOnline);
      }
    }

    if (tip) {
      renderTip(tip);
    }
  }

  function renderTip(tip) {
    if (!tip) return;

    // Trigger subtle card animation
    elements.tipCard.classList.remove('animating');
    void elements.tipCard.offsetWidth; // Trigger reflow
    elements.tipCard.classList.add('animating');

    // Update Content
    elements.tipCategoryBadge.textContent = tip.categoryName || '💡 Mẹo vặt';
    elements.tipModeBadge.textContent = currentSettings.tipMode === 'daily' ? '📅 Mẹo của ngày' : '🎲 Ngẫu nhiên';
    
    // Online Badge
    if (elements.tipOnlineBadge) {
      elements.tipOnlineBadge.style.display = tip.isOnline ? 'flex' : 'none';
    }

    elements.tipTitle.textContent = tip.title || '';
    elements.tipContent.textContent = tip.content || '';

    // Action box
    if (tip.action) {
      elements.tipActionBox.style.display = 'flex';
      elements.tipActionText.textContent = tip.action;
    } else {
      elements.tipActionBox.style.display = 'none';
    }

    // Tags
    elements.tipTagsRow.innerHTML = '';
    if (tip.tags && Array.isArray(tip.tags)) {
      tip.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-pill';
        tagEl.textContent = tag.startsWith('#') ? tag : `#${tag}`;
        elements.tipTagsRow.appendChild(tagEl);
      });
    }

    // Favorite state
    updateFavButtonState(tip.id);
  }

  function updateFavButtonState(tipId) {
    const isFav = favoriteIds.includes(tipId);
    if (isFav) {
      elements.btnFavTip.classList.add('favorited');
      elements.favHeartIcon.textContent = '❤️';
      elements.favBtnLabel.textContent = 'Đã thích';
    } else {
      elements.btnFavTip.classList.remove('favorited');
      elements.favHeartIcon.textContent = '🤍';
      elements.favBtnLabel.textContent = 'Yêu thích';
    }
  }

  async function showNextTip() {
    let tip = null;
    
    // Try fetching fresh online tip with 40% probability if online toggle is enabled
    if (currentSettings.autoFetchOnline && Math.random() < 0.45 && navigator.onLine) {
      tip = await tipManager.fetchLiveOnlineTip(currentCategoryFilter);
      if (tip) {
        showToast('Đã tải 1 mẹo mới từ Internet! 🌐', '⚡');
      }
    }

    // Fallback to anti-repetition local/cached random tip
    if (!tip) {
      tip = await tipManager.getRandomTip(currentSettings.selectedCategories, currentCategoryFilter, currentSettings.autoFetchOnline);
    }

    if (tip) {
      renderTip(tip);
    } else {
      showToast('Không tìm thấy mẹo nào trong danh mục này!', '⚠️');
    }
  }

  async function toggleFavoriteCurrentTip() {
    if (!tipManager.currentTip) return;
    const tipId = tipManager.currentTip.id;
    const index = favoriteIds.indexOf(tipId);

    if (index > -1) {
      favoriteIds.splice(index, 1);
      showToast('Đã xóa khỏi danh sách yêu thích', '💔');
    } else {
      favoriteIds.push(tipId);
      showToast('Đã lưu mẹo vào mục Yêu thích!', '❤️');
    }

    await window.StorageService.saveFavorites(favoriteIds);
    updateFavButtonState(tipId);
    updateFavoritesBadge();
    if (elements.favDrawerOverlay.classList.contains('active')) {
      renderDrawerList();
    }
  }

  function updateFavoritesBadge() {
    elements.favCountBadge.textContent = favoriteIds.length;
    elements.savedCountSpan.textContent = favoriteIds.length;
    elements.customCountSpan.textContent = tipManager.customTips.length;
  }

  function copyCurrentTip(includeFormatted = false) {
    if (!tipManager.currentTip) return;
    const tip = tipManager.currentTip;
    let text = `${tip.title}\n\n${tip.content}`;
    if (tip.action) text += `\n\n${tip.action}`;
    if (includeFormatted) {
      text = `💡 [Life Hacks] ${tip.title}\n━━━━━━━━━━━━━━━━━━━━\n${tip.content}\n\n${tip.action || ''}\n\n🔖 ${tip.tags ? tip.tags.join(' ') : ''}`;
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast('Đã sao chép nội dung vào Clipboard!', '📋');
    }).catch(() => {
      showToast('Không thể sao chép!', '❌');
    });
  }

  /* ==========================================================================
     Text-To-Speech (SpeechSynthesis)
     ========================================================================== */

  function toggleSpeech() {
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt của bạn không hỗ trợ đọc âm thanh', '⚠️');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      elements.btnSpeakTip.classList.remove('speaking');
      return;
    }

    if (!tipManager.currentTip) return;
    const tip = tipManager.currentTip;
    const textToRead = `${tip.title}. ${tip.content}. ${tip.action || ''}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;

    utterance.onstart = () => {
      isSpeaking = true;
      elements.btnSpeakTip.classList.add('speaking');
    };

    utterance.onend = () => {
      isSpeaking = false;
      elements.btnSpeakTip.classList.remove('speaking');
    };

    utterance.onerror = () => {
      isSpeaking = false;
      elements.btnSpeakTip.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
  }

  /* ==========================================================================
     Search Engine Handling
     ========================================================================== */

  function setupSearchEngineDisplay() {
    const engineKey = currentSettings.searchEngine || 'google';
    const engine = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
    elements.currentEngineIcon.textContent = engine.icon;
    elements.searchInput.placeholder = `Tìm kiếm với ${engine.name}... (Phím /)`;
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = elements.searchInput.value.trim();
    if (!query) return;

    // Check if query is URL
    if (/^(http|https):\/\/[^ "]+$/.test(query) || (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query) && !query.includes(' '))) {
      const url = query.startsWith('http') ? query : `https://${query}`;
      window.location.href = url;
      return;
    }

    const engineKey = currentSettings.searchEngine || 'google';
    const engine = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
    window.location.href = `${engine.url}${encodeURIComponent(query)}`;
  }

  /* ==========================================================================
     Shortcuts Rendering & Management
     ========================================================================== */

  function renderShortcuts() {
    elements.shortcutsGrid.innerHTML = '';
    const shortcuts = currentSettings.shortcuts || [];

    shortcuts.forEach(sc => {
      const item = document.createElement('a');
      item.className = 'shortcut-item';
      item.href = sc.url;
      item.title = `${sc.title} - ${sc.url}`;
      item.innerHTML = `
        <div class="shortcut-icon-box">${sc.icon || '🔗'}</div>
        <span class="shortcut-title">${sc.title}</span>
      `;
      elements.shortcutsGrid.appendChild(item);
    });

    // Add "+" shortcut button
    const addBtn = document.createElement('div');
    addBtn.className = 'shortcut-item btn-add-shortcut';
    addBtn.title = 'Thêm lối tắt mới';
    addBtn.innerHTML = `
      <div class="shortcut-icon-box">➕</div>
      <span class="shortcut-title">Thêm</span>
    `;
    addBtn.addEventListener('click', () => {
      openModal(elements.shortcutModal);
    });
    elements.shortcutsGrid.appendChild(addBtn);
  }

  /* ==========================================================================
     Favorites & Custom Tips Drawer
     ========================================================================== */

  function openFavoritesDrawer() {
    elements.favDrawerOverlay.classList.add('active');
    renderDrawerList();
  }

  function closeFavoritesDrawer() {
    elements.favDrawerOverlay.classList.remove('active');
  }

  function renderDrawerList() {
    const query = elements.favSearchInput.value.trim();
    elements.drawerListContainer.innerHTML = '';

    if (activeDrawerTab === 'saved') {
      let savedTips = favoriteIds.map(id => tipManager.getTipById(id)).filter(Boolean);
      if (query) savedTips = tipManager.searchTips(query, savedTips);

      if (savedTips.length === 0) {
        elements.drawerListContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🤍</div>
            <p>${query ? 'Không tìm thấy mẹo nào khớp với từ khóa' : 'Bạn chưa lưu mẹo nào vào mục yêu thích.'}</p>
            <small>Bấm phím <b>F</b> hoặc nút Thả tim trên thẻ mẹo để lưu lại nhé!</small>
          </div>
        `;
        return;
      }

      savedTips.forEach(tip => {
        const item = document.createElement('div');
        item.className = 'drawer-item-card';
        item.innerHTML = `
          <div class="drawer-item-header">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="category-badge">${tip.categoryName || 'Mẹo vặt'}</span>
              ${tip.isOnline ? '<span class="online-badge" style="font-size:0.65rem;">🌐 Online</span>' : ''}
            </div>
            <button class="btn-sm btn-outline btn-remove-fav" data-id="${tip.id}" title="Bỏ yêu thích">Bỏ lưu 💔</button>
          </div>
          <div class="drawer-item-title">${tip.title}</div>
          <div class="drawer-item-content">${tip.content}</div>
          <div class="drawer-item-actions">
            <button class="btn-sm btn-outline btn-view-tip" data-id="${tip.id}">Xem mẹo này</button>
            <button class="btn-sm btn-outline btn-copy-drawer" data-id="${tip.id}">Sao chép</button>
          </div>
        `;

        // Bind events
        item.querySelector('.btn-remove-fav').addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          favoriteIds = favoriteIds.filter(fId => fId !== id);
          await window.StorageService.saveFavorites(favoriteIds);
          updateFavoritesBadge();
          updateFavButtonState(tipManager.currentTip ? tipManager.currentTip.id : null);
          renderDrawerList();
          showToast('Đã bỏ lưu mẹo', '🗑️');
        });

        item.querySelector('.btn-view-tip').addEventListener('click', () => {
          renderTip(tip);
          tipManager.currentTip = tip;
          closeFavoritesDrawer();
        });

        item.querySelector('.btn-copy-drawer').addEventListener('click', () => {
          navigator.clipboard.writeText(`${tip.title}\n\n${tip.content}`);
          showToast('Đã sao chép!', '📋');
        });

        elements.drawerListContainer.appendChild(item);
      });
    } else {
      // Custom Tips Tab
      let customTips = tipManager.customTips;
      if (query) customTips = tipManager.searchTips(query, customTips);

      if (customTips.length === 0) {
        elements.drawerListContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">✍️</div>
            <p>Bạn chưa tạo mẹo cá nhân nào.</p>
            <button class="btn-sm btn-primary" id="btnCreateFromEmpty">+ Tạo mẹo đầu tiên</button>
          </div>
        `;
        const btnEmpty = document.getElementById('btnCreateFromEmpty');
        if (btnEmpty) btnEmpty.addEventListener('click', () => openModal(elements.customTipModal));
        return;
      }

      customTips.forEach(tip => {
        const item = document.createElement('div');
        item.className = 'drawer-item-card';
        item.innerHTML = `
          <div class="drawer-item-header">
            <span class="category-badge">${tip.categoryName || 'Tự tạo'}</span>
            <button class="btn-sm btn-outline btn-delete-custom" data-id="${tip.id}" title="Xóa mẹo này">Xóa 🗑️</button>
          </div>
          <div class="drawer-item-title">${tip.title}</div>
          <div class="drawer-item-content">${tip.content}</div>
          <div class="drawer-item-actions">
            <button class="btn-sm btn-outline btn-view-tip" data-id="${tip.id}">Xem mẹo này</button>
          </div>
        `;

        item.querySelector('.btn-delete-custom').addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const updated = tipManager.customTips.filter(t => t.id !== id);
          tipManager.setCustomTips(updated);
          await window.StorageService.saveCustomTips(updated);
          updateFavoritesBadge();
          renderDrawerList();
          showToast('Đã xóa mẹo tự tạo!', '🗑️');
        });

        item.querySelector('.btn-view-tip').addEventListener('click', () => {
          renderTip(tip);
          tipManager.currentTip = tip;
          closeFavoritesDrawer();
        });

        elements.drawerListContainer.appendChild(item);
      });
    }
  }

  /* ==========================================================================
     Export & Import JSON
     ========================================================================== */

  async function exportData() {
    const todoList = await window.StorageService.getTodoList();
    const pomodoroState = await window.StorageService.getPomodoroState();

    const backupData = {
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      favorites: favoriteIds,
      customTips: tipManager.customTips,
      cachedOnlineTips: tipManager.cachedOnlineTips,
      settings: currentSettings,
      todoList: todoList,
      pomodoroState: pomodoroState
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-hacks-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file sao lưu JSON toàn bộ dữ liệu thành công!', '💾');
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.favorites && Array.isArray(data.favorites)) {
          favoriteIds = Array.from(new Set([...favoriteIds, ...data.favorites]));
          await window.StorageService.saveFavorites(favoriteIds);
        }
        if (data.customTips && Array.isArray(data.customTips)) {
          const combined = [...tipManager.customTips, ...data.customTips];
          tipManager.setCustomTips(combined);
          await window.StorageService.saveCustomTips(combined);
        }
        if (data.settings) {
          currentSettings = { ...currentSettings, ...data.settings };
          await window.StorageService.saveSettings(currentSettings);
          applyTheme(currentSettings.theme);
          applyWidgetVisibility();
        }
        if (data.todoList && Array.isArray(data.todoList)) {
          const existing = await window.StorageService.getTodoList();
          const existingIds = new Set(existing.map(t => t.id));
          const newTodos = data.todoList.filter(t => !existingIds.has(t.id));
          const combinedTodos = [...newTodos, ...existing];
          await window.StorageService.saveTodoList(combinedTodos);
          if (typeof initTodoList === 'function') await initTodoList();
        }
        if (data.pomodoroState) {
          await window.StorageService.savePomodoroState(data.pomodoroState);
          if (typeof initPomodoro === 'function') await initPomodoro();
        }
        updateFavoritesBadge();
        renderDrawerList();
        showToast('Nhập toàn bộ dữ liệu thành công!', '✅');
      } catch (err) {
        showToast('File JSON không hợp lệ!', '❌');
      }
    };
    reader.readAsText(file);
  }

  /* ==========================================================================
     Modal Helpers
     ========================================================================== */

  function openModal(modalEl) {
    modalEl.classList.add('active');
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
  }

  /* ==========================================================================
     Settings Modal Logic
     ========================================================================== */

  function populateSettingsModal() {
    // App Version Info & Build Timestamp
    const appVersion = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest)
      ? chrome.runtime.getManifest().version
      : '1.0.0';
    const buildTime = '26/08/2026 16:30';

    if (elements.settingVersionBadge) {
      elements.settingVersionBadge.textContent = `v${appVersion}`;
    }
    if (elements.settingVersionTime) {
      elements.settingVersionTime.textContent = `🕒 ${buildTime}`;
    }

    // Tip mode
    const modeRadios = document.querySelectorAll('input[name="tipModeRadio"]');
    modeRadios.forEach(r => {
      r.checked = r.value === currentSettings.tipMode;
    });

    // Categories
    document.querySelectorAll('.category-toggle').forEach(cb => {
      cb.checked = currentSettings.selectedCategories.includes(cb.value);
    });

    // Search Engine
    elements.settingSearchEngine.value = currentSettings.searchEngine || 'google';

    // Auto Online Fetch
    if (elements.toggleAutoOnline) {
      elements.toggleAutoOnline.checked = currentSettings.autoFetchOnline !== false;
    }

    // Widget toggles
    elements.toggleClock.checked = currentSettings.showClock;
    elements.toggleSearch.checked = currentSettings.showSearch;
    elements.toggleShortcuts.checked = currentSettings.showShortcuts;
    elements.toggleShortcutHint.checked = currentSettings.showShortcutsHint;
    if (elements.togglePomodoro) elements.togglePomodoro.checked = currentSettings.showPomodoro !== false;
    if (elements.toggleTodoList) elements.toggleTodoList.checked = currentSettings.showTodoList !== false;
  }

  async function saveSettingsFromModal() {
    const selectedMode = document.querySelector('input[name="tipModeRadio"]:checked')?.value || 'random';
    
    const selectedCats = [];
    document.querySelectorAll('.category-toggle:checked').forEach(cb => {
      selectedCats.push(cb.value);
    });

    currentSettings.tipMode = selectedMode;
    currentSettings.selectedCategories = selectedCats.length > 0 ? selectedCats : ['productivity', 'tech', 'health', 'finance', 'life', 'mindset'];
    currentSettings.searchEngine = elements.settingSearchEngine.value;
    currentSettings.autoFetchOnline = elements.toggleAutoOnline ? elements.toggleAutoOnline.checked : true;
    currentSettings.showClock = elements.toggleClock.checked;
    currentSettings.showSearch = elements.toggleSearch.checked;
    currentSettings.showShortcuts = elements.toggleShortcuts.checked;
    currentSettings.showShortcutsHint = elements.toggleShortcutHint.checked;
    if (elements.togglePomodoro) currentSettings.showPomodoro = elements.togglePomodoro.checked;
    if (elements.toggleTodoList) currentSettings.showTodoList = elements.toggleTodoList.checked;

    await window.StorageService.saveSettings(currentSettings);
    applyWidgetVisibility();
    setupSearchEngineDisplay();
    closeModal(elements.settingsModal);
    showToast('Đã lưu cấu hình cài đặt!', '⚙️');
  }

  /* ==========================================================================
     Pomodoro Focus Engine
     ========================================================================== */

  let pomoState = {
    mode: 'focus', // 'focus' | 'shortBreak' | 'longBreak'
    remainingSeconds: 1500,
    isRunning: false,
    endTime: null,
    completedToday: 0,
    lastCompletedDate: null
  };
  let pomoTimerInterval = null;

  async function initPomodoro() {
    const saved = await window.StorageService.getPomodoroState();
    const todayStr = getTodayStr();

    if (saved) {
      pomoState = { ...pomoState, ...saved };
      if (pomoState.lastCompletedDate !== todayStr) {
        pomoState.completedToday = 0;
        pomoState.lastCompletedDate = todayStr;
      }
      if (pomoState.isRunning && pomoState.endTime) {
        const now = Date.now();
        const diffSeconds = Math.floor((pomoState.endTime - now) / 1000);
        if (diffSeconds > 0) {
          pomoState.remainingSeconds = diffSeconds;
          startPomoTimer(false);
        } else {
          pomoState.remainingSeconds = 0;
          pomoState.isRunning = false;
          pomoState.endTime = null;
        }
      }
    } else {
      pomoState.lastCompletedDate = todayStr;
    }
    renderPomoUI();
    bindPomoEvents();
  }

  function formatTimeMS(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function playPomoChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  }

  function renderPomoUI() {
    const timeStr = formatTimeMS(pomoState.remainingSeconds);
    if (elements.pomoTimerDisplay) elements.pomoTimerDisplay.textContent = timeStr;
    if (elements.pomoTimerBig) elements.pomoTimerBig.textContent = timeStr;
    if (elements.pomoSuccessCount) elements.pomoSuccessCount.textContent = pomoState.completedToday || 0;
    if (elements.pomoPillCount) elements.pomoPillCount.textContent = `🍅 ${pomoState.completedToday || 0}`;

    const modeConfigs = {
      focus: { icon: '🎯', label: 'Tập trung (Focus)', text: 'Sẵn sàng tập trung!' },
      shortBreak: { icon: '☕', label: 'Nghỉ ngắn', text: 'Thư giãn chút nào!' },
      longBreak: { icon: '🌿', label: 'Nghỉ dài', text: 'Nạp lại năng lượng!' }
    };
    const config = modeConfigs[pomoState.mode] || modeConfigs.focus;
    if (elements.pomoIcon) elements.pomoIcon.textContent = config.icon;
    if (elements.pomoStatusLabel) elements.pomoStatusLabel.textContent = pomoState.isRunning ? `Đang chạy: ${config.label}` : config.text;

    if (elements.btnPomoStartPause) {
      elements.btnPomoStartPause.textContent = pomoState.isRunning ? '⏸️ Tạm dừng' : '▶️ Bắt đầu';
    }

    if (elements.btnPomoToggle) {
      elements.btnPomoToggle.classList.toggle('running', pomoState.isRunning);
    }

    if (elements.pomoPopupCard) {
      elements.pomoPopupCard.querySelectorAll('.pomo-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === pomoState.mode);
      });
    }
  }

  function startPomoTimer(isNewStart = true) {
    if (pomoTimerInterval) clearInterval(pomoTimerInterval);

    pomoState.isRunning = true;
    if (isNewStart || !pomoState.endTime) {
      pomoState.endTime = Date.now() + pomoState.remainingSeconds * 1000;
    }
    window.StorageService.savePomodoroState(pomoState);
    renderPomoUI();

    pomoTimerInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((pomoState.endTime - now) / 1000));
      pomoState.remainingSeconds = remaining;

      if (remaining <= 0) {
        clearInterval(pomoTimerInterval);
        pomoTimerInterval = null;
        pomoState.isRunning = false;
        pomoState.endTime = null;

        const isFocusMode = pomoState.mode === 'focus';
        if (isFocusMode) {
          const todayStr = getTodayStr();
          if (pomoState.lastCompletedDate !== todayStr) {
            pomoState.completedToday = 1;
            pomoState.lastCompletedDate = todayStr;
          } else {
            pomoState.completedToday = (pomoState.completedToday || 0) + 1;
          }
        }

        window.StorageService.savePomodoroState(pomoState);
        renderPomoUI();
        playPomoChime();

        if (isFocusMode) {
          showToast('🎉 Xuất sắc! Bạn đã hoàn thành 25m tập trung!', '🎯');
          handlePomodoroBreakStart();
          // Show break selection overlay
          if (elements.pomoBreakOverlay) {
            elements.pomoBreakOverlay.style.display = 'flex';
          }
        } else {
          showToast('⏰ Đã hết thời gian nghỉ! Sẵn sàng quay lại làm việc nào!', '⏱️');
          switchPomoMode('focus', 1500);
        }
      } else {
        renderPomoUI();
      }
    }, 1000);
  }

  function pausePomoTimer() {
    if (pomoTimerInterval) clearInterval(pomoTimerInterval);
    pomoTimerInterval = null;
    pomoState.isRunning = false;
    pomoState.endTime = null;
    window.StorageService.savePomodoroState(pomoState);
    renderPomoUI();
  }

  function resetPomoTimer() {
    pausePomoTimer();
    const defaults = { focus: 1500, shortBreak: 300, longBreak: 900 };
    pomoState.remainingSeconds = defaults[pomoState.mode] || 1500;
    window.StorageService.savePomodoroState(pomoState);
    renderPomoUI();
  }

  function switchPomoMode(mode, seconds) {
    pausePomoTimer();
    pomoState.mode = mode;
    pomoState.remainingSeconds = seconds;
    if (mode === 'shortBreak' || mode === 'longBreak') {
      handlePomodoroBreakStart();
    }
    window.StorageService.savePomodoroState(pomoState);
    renderPomoUI();
  }

  function bindPomoEvents() {
    if (elements.btnPomoToggle) {
      elements.btnPomoToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = elements.pomoPopupCard.style.display === 'none';
        elements.pomoPopupCard.style.display = isHidden ? 'flex' : 'none';
      });
    }

    if (elements.btnClosePomoCard) {
      elements.btnClosePomoCard.addEventListener('click', () => {
        elements.pomoPopupCard.style.display = 'none';
      });
    }

    document.addEventListener('click', (e) => {
      if (elements.pomoPopupCard && elements.pomoHeaderWidget && !elements.pomoHeaderWidget.contains(e.target)) {
        elements.pomoPopupCard.style.display = 'none';
      }
    });

    if (elements.btnPomoStartPause) {
      elements.btnPomoStartPause.addEventListener('click', () => {
        if (pomoState.isRunning) {
          pausePomoTimer();
        } else {
          startPomoTimer();
        }
      });
    }

    if (elements.btnPomoReset) {
      elements.btnPomoReset.addEventListener('click', resetPomoTimer);
    }

    if (elements.pomoPopupCard) {
      elements.pomoPopupCard.querySelectorAll('.pomo-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.dataset.mode;
          const seconds = parseInt(btn.dataset.seconds, 10);
          switchPomoMode(mode, seconds);
        });
      });
    }

    // Post-focus Break Options Event Handlers
    if (elements.pomoBreakOverlay) {
      elements.pomoBreakOverlay.querySelectorAll('.btn-break-opt').forEach(btn => {
        if (btn.id === 'btnApplyCustomBreak') return;
        btn.addEventListener('click', () => {
          const mins = parseInt(btn.dataset.minutes, 10) || 5;
          elements.pomoBreakOverlay.style.display = 'none';
          switchPomoMode(mins >= 15 ? 'longBreak' : 'shortBreak', mins * 60);
          startPomoTimer(true);
          showToast(`☕ Bắt đầu nghỉ giải lao ${mins} phút!`, '☕');
        });
      });
    }

    if (elements.btnApplyCustomBreak && elements.customBreakInput) {
      elements.btnApplyCustomBreak.addEventListener('click', () => {
        const mins = Math.max(1, Math.min(120, parseInt(elements.customBreakInput.value, 10) || 8));
        elements.pomoBreakOverlay.style.display = 'none';
        switchPomoMode('shortBreak', mins * 60);
        startPomoTimer(true);
        showToast(`☕ Bắt đầu nghỉ giải lao ${mins} phút!`, '☕');
      });
    }

    if (elements.btnSkipBreak) {
      elements.btnSkipBreak.addEventListener('click', () => {
        elements.pomoBreakOverlay.style.display = 'none';
        switchPomoMode('focus', 1500);
        showToast('🎯 Sẵn sàng cho phiên tập trung tiếp theo!', '🚀');
      });
    }
  }

  /* ==========================================================================
     Left Side To-Do List Engine
     ========================================================================== */

  let todoList = [];
  let activeTodoTab = 'active';
  let selectedTaskType = 'single'; // 'single' | 'recurring'
  let selectedWeekdays = new Set([1, 2, 3, 4, 5]); // Default Mon-Fri
  let taskTimerInterval = null;

  let dailyWorkHistory = {};
  let currentEfficiencyMode = 'auto'; // 'auto' | 'yesterday' | 'today'

  /* ==========================================================================
     Task Execution Timer & Pomodoro Break Integration Engine
     ========================================================================== */

  function getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function trackDailyWorkSeconds(addedSec) {
    if (!addedSec || addedSec <= 0) return;
    const todayStr = getTodayStr();
    dailyWorkHistory[todayStr] = (dailyWorkHistory[todayStr] || 0) + addedSec;
    window.StorageService.saveDailyWorkHistory(dailyWorkHistory);
    updateDailyEfficiencyWidget();
  }

  function updateDailyEfficiencyWidget() {
    if (!elements.dailyEfficiencyCard) return;

    const now = new Date();
    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();
    
    let targetDateStr = (now.getHours() < 14) ? yesterdayStr : todayStr;
    let isYesterday = (targetDateStr === yesterdayStr);

    if (currentEfficiencyMode === 'yesterday') {
      targetDateStr = yesterdayStr;
      isYesterday = true;
    } else if (currentEfficiencyMode === 'today') {
      targetDateStr = todayStr;
      isYesterday = false;
    }

    const DAILY_TARGET_SECONDS = 7.5 * 3600; // 27,000 seconds = 7.5 hours
    const totalSec = dailyWorkHistory[targetDateStr] || 0;
    const pct = Math.min(100, Math.round((totalSec / DAILY_TARGET_SECONDS) * 100));

    if (elements.efficiencyTitle) {
      elements.efficiencyTitle.textContent = isYesterday ? 'Hiệu suất ngày trước' : 'Hiệu suất hôm nay';
    }

    if (elements.efficiencyDate) {
      const parts = targetDateStr.split('-');
      elements.efficiencyDate.textContent = `${parts[2]}/${parts[1]}`;
    }

    if (elements.efficiencyActualTime) {
      elements.efficiencyActualTime.textContent = formatWorkDuration(totalSec);
    }

    if (elements.efficiencyProgressFill) {
      elements.efficiencyProgressFill.style.width = `${pct}%`;
    }

    if (elements.efficiencyBadge) {
      let ratingClass = 'low';
      let icon = '💡';
      if (pct >= 80) {
        ratingClass = 'high';
        icon = '🚀';
      } else if (pct >= 50) {
        ratingClass = 'good';
        icon = '⚡';
      }

      elements.efficiencyBadge.className = `efficiency-badge ${ratingClass}`;
      elements.efficiencyBadge.textContent = `${pct}% ${icon}`;
      elements.efficiencyBadge.title = `Làm được ${formatWorkDuration(totalSec)} trên tổng quỹ chuẩn 7.5h`;
    }
  }

  function formatWorkDuration(totalSeconds) {
    if (!totalSeconds || totalSeconds <= 0) return '00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function getLiveWorkSeconds(todo) {
    let sec = todo.totalWorkSeconds || 0;
    if (todo.timerRunning && todo.lastStartTime) {
      sec += Math.floor((Date.now() - todo.lastStartTime) / 1000);
    }
    return sec;
  }

  function startTaskTimerEngine() {
    if (taskTimerInterval) return;
    taskTimerInterval = setInterval(() => {
      let updated = false;
      let anyRunning = false;
      const now = Date.now();

      const isOnPomoBreak = (pomoState && (pomoState.mode === 'shortBreak' || pomoState.mode === 'longBreak') && pomoState.isRunning);

      todoList.forEach(todo => {
        if (todo.timerRunning && !todo.completed) {
          if (isOnPomoBreak) {
            // Auto pause task timer when Pomodoro is on break
            if (todo.lastStartTime) {
              todo.totalWorkSeconds = (todo.totalWorkSeconds || 0) + Math.floor((now - todo.lastStartTime) / 1000);
            }
            todo.timerRunning = false;
            todo.lastStartTime = null;
            todo.onBreak = true;
            updated = true;
            showToast(`☕ Tạm dừng đếm giờ task "${todo.text}" để bạn nghỉ Pomodoro!`, '☕');
          } else {
            anyRunning = true;
            if (todo.lastStartTime) {
              const elapsedSeconds = Math.floor((now - todo.lastStartTime) / 1000);
              if (elapsedSeconds >= 1) {
                todo.totalWorkSeconds = (todo.totalWorkSeconds || 0) + elapsedSeconds;
                todo.lastStartTime = now;
                updated = true;
                trackDailyWorkSeconds(elapsedSeconds);
              }
            } else {
              todo.lastStartTime = now;
            }
          }
        }
      });

      if (updated) {
        window.StorageService.saveTodoList(todoList);
        updateTaskTimerDisplays();
      }

      if (!anyRunning && taskTimerInterval) {
        clearInterval(taskTimerInterval);
        taskTimerInterval = null;
      }
    }, 1000);
  }

  function updateTaskTimerDisplays() {
    todoList.forEach(todo => {
      const itemEl = document.querySelector(`li[data-todo-id="${todo.id}"]`);
      if (!itemEl) return;

      const badgeEl = itemEl.querySelector('.todo-timer-badge');
      const btnEl = itemEl.querySelector('.todo-timer-btn');
      const liveSec = getLiveWorkSeconds(todo);

      if (badgeEl) {
        badgeEl.textContent = `⏱️ ${formatWorkDuration(liveSec)}`;
        badgeEl.classList.toggle('active-timing', !!todo.timerRunning);
        badgeEl.classList.toggle('on-break', !!todo.onBreak);
      }
      if (btnEl) {
        btnEl.classList.toggle('running', !!todo.timerRunning);
        btnEl.innerHTML = todo.timerRunning ? '⏸️ Tạm dừng' : (todo.onBreak ? '▶️ Tiếp tục' : '▶️ Bắt đầu');
      }
    });

    // Update Top Right Active Task Floating Banner Widget
    const activeTask = todoList.find(t => (t.timerRunning || t.onBreak) && !t.completed);
    if (elements.activeTaskWidget) {
      if (activeTask) {
        elements.activeTaskWidget.style.display = 'flex';
        elements.activeTaskWidget.classList.toggle('on-break', !!activeTask.onBreak);
        if (elements.activeTaskTitle) {
          elements.activeTaskTitle.textContent = activeTask.text;
          elements.activeTaskTitle.title = activeTask.text;
        }
        if (elements.activeTaskStatusIcon) {
          elements.activeTaskStatusIcon.textContent = activeTask.onBreak ? '☕' : '⚡';
        }
        if (elements.activeTaskTimer) {
          const liveSec = getLiveWorkSeconds(activeTask);
          elements.activeTaskTimer.textContent = `⏱️ ${formatWorkDuration(liveSec)}`;
        }
        if (elements.btnActiveTaskPause) {
          elements.btnActiveTaskPause.innerHTML = activeTask.timerRunning ? '⏸️ Tạm dừng' : '▶️ Tiếp tục';
        }
      } else {
        elements.activeTaskWidget.style.display = 'none';
      }
    }
  }

  function toggleTaskTimer(todoId) {
    const target = todoList.find(t => t.id === todoId);
    if (!target || target.completed) return;

    if (pomoState && (pomoState.mode === 'shortBreak' || pomoState.mode === 'longBreak') && pomoState.isRunning) {
      showToast('⚠️ Pomodoro đang trong thời gian nghỉ giải lao!', '☕');
    }

    const now = Date.now();
    if (target.timerRunning) {
      // Pause target task
      if (target.lastStartTime) {
        const addedSec = Math.floor((now - target.lastStartTime) / 1000);
        target.totalWorkSeconds = (target.totalWorkSeconds || 0) + addedSec;
        trackDailyWorkSeconds(addedSec);
      }
      target.timerRunning = false;
      target.lastStartTime = null;
      target.onBreak = false;
      showToast(`⏸️ Đã tạm dừng đếm giờ task "${target.text}" (${formatWorkDuration(target.totalWorkSeconds)})`, '⏱️');
    } else {
      // Stop any other currently running tasks
      todoList.forEach(t => {
        if (t.timerRunning && t.id !== todoId) {
          if (t.lastStartTime) {
            t.totalWorkSeconds = (t.totalWorkSeconds || 0) + Math.floor((now - t.lastStartTime) / 1000);
          }
          t.timerRunning = false;
          t.lastStartTime = null;
          t.onBreak = false;
        }
      });

      // Start target task
      target.timerRunning = true;
      target.lastStartTime = now;
      target.onBreak = false;
      showToast(`🚀 Đã chuyển "${target.text}" sang bên trái màn hình!`, '⚡');
      startTaskTimerEngine();

      if (elements.activeTaskWidget) {
        elements.activeTaskWidget.classList.remove('fly-in');
        void elements.activeTaskWidget.offsetWidth; // trigger reflow
        elements.activeTaskWidget.classList.add('fly-in');
      }
    }

    window.StorageService.saveTodoList(todoList);
    renderTodoList();
  }

  function handlePomodoroBreakStart() {
    let pausedAny = false;
    const now = Date.now();
    todoList.forEach(t => {
      if (t.timerRunning && !t.completed) {
        if (t.lastStartTime) {
          t.totalWorkSeconds = (t.totalWorkSeconds || 0) + Math.floor((now - t.lastStartTime) / 1000);
        }
        t.timerRunning = false;
        t.lastStartTime = null;
        t.onBreak = true;
        pausedAny = true;
      }
    });

    if (pausedAny) {
      window.StorageService.saveTodoList(todoList);
      renderTodoList();
      showToast('☕ Đã tự động tạm dừng đếm giờ task để loại trừ thời gian nghỉ Pomodoro!', '☕');
    }
  }

  async function initTodoList() {
    todoList = await window.StorageService.getTodoList();
    dailyWorkHistory = await window.StorageService.getDailyWorkHistory();
    checkRecurringTasksReset();
    renderTodoList();
    bindTodoEvents();
    updateDailyEfficiencyWidget();

    if (todoList.some(t => t.timerRunning && !t.completed)) {
      startTaskTimerEngine();
    }
  }

  function checkRecurringTasksReset() {
    const todayStr = getTodayStr();
    const now = new Date();
    const currentDay = now.getDay();
    const currentDayOfMonth = now.getDate();
    let updated = false;

    todoList.forEach(todo => {
      if (todo.isMonthly && todo.repeatMonthDay) {
        if (currentDayOfMonth === todo.repeatMonthDay) {
          if (todo.lastCompletedDate !== todayStr && todo.completed) {
            todo.completed = false;
            todo.lastNotifiedMinute = null;
            updated = true;
          }
        }
      } else if (todo.isRecurring && Array.isArray(todo.repeatDays)) {
        if (todo.repeatDays.includes(currentDay)) {
          if (todo.lastCompletedDate !== todayStr && todo.completed) {
            todo.completed = false;
            todo.lastNotifiedMinute = null;
            updated = true;
          }
        }
      }
    });

    if (updated) {
      window.StorageService.saveTodoList(todoList);
    }
  }

  function getDeadlineInfo(todo) {
    if (!todo) return null;

    if (todo.isMonthly && todo.repeatMonthDay) {
      const timeText = todo.dueTime ? ` (${todo.dueTime})` : '';
      return { text: `📆 Ngày ${todo.repeatMonthDay} h.tháng${timeText}`, type: 'monthly' };
    }

    if (todo.isRecurring && Array.isArray(todo.repeatDays)) {
      const dayLabels = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' };
      const daysText = todo.repeatDays.map(d => dayLabels[d]).filter(Boolean).join(',');
      const timeText = todo.dueTime ? ` (${todo.dueTime})` : '';
      return { text: `🔁 ${daysText}${timeText}`, type: 'recurring' };
    }

    if (!todo.dueDate) return null;

    const timePart = todo.dueTime || '23:59';
    const targetDate = new Date(`${todo.dueDate}T${timePart}:00`);
    const now = new Date();
    const diffMs = targetDate - now;
    const diffMins = Math.round(diffMs / (1000 * 60));

    const estMins = parseInt(todo.estMinutes, 10) || 0;
    const recStartDate = estMins > 0 ? new Date(targetDate.getTime() - estMins * 60 * 1000) : targetDate;
    const recStartHours = String(recStartDate.getHours()).padStart(2, '0');
    const recStartMinutes = String(recStartDate.getMinutes()).padStart(2, '0');
    const recStartStr = `${recStartHours}:${recStartMinutes}`;

    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diffDays = Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

    const isOverdue = diffMs < 0;
    const isMustStartNow = !isOverdue && estMins > 0 && now >= recStartDate;

    if (isOverdue) {
      if (diffDays === 0) {
        return { 
          text: `🔥 QUÁ HẠN ${Math.abs(diffMins)}m! (${todo.dueTime || ''})`, 
          type: 'urgent', 
          diffDays, 
          isOverdue: true, 
          targetDate 
        };
      }
      return { 
        text: `🔥 QUÁ HẠN ${Math.abs(diffDays)}d!`, 
        type: 'urgent', 
        diffDays, 
        isOverdue: true, 
        targetDate 
      };
    } else if (isMustStartNow) {
      return { 
        text: `⚡ CẦN LÀM NGAY! (Bắt đầu từ ${recStartStr})`, 
        type: 'urgent', 
        diffDays, 
        isMustStartNow: true, 
        recStartDate, 
        targetDate 
      };
    } else if (diffDays === 0) {
      if (todo.dueTime) {
        if (estMins > 0) {
          return { 
            text: `⏰ Nên bd từ ${recStartStr} (Hạn ${todo.dueTime})`, 
            type: 'warning', 
            diffDays, 
            recStartDate, 
            targetDate 
          };
        }
        return { text: `Hạn: Hôm nay ${todo.dueTime} ⏳`, type: 'warning', diffDays, targetDate };
      }
      return { text: 'Hạn: Hôm nay 🔥', type: 'urgent', diffDays, targetDate };
    } else if (diffDays === 1) {
      if (estMins > 0) {
        return { text: `Hạn N.mai (Nên bd lúc ${recStartStr}) ⏳`, type: 'warning', diffDays, recStartDate, targetDate };
      }
      return { text: `Hạn: N.mai ${todo.dueTime ? todo.dueTime : ''} ⏳`, type: 'warning', diffDays, targetDate };
    } else if (diffDays <= 3) {
      return { text: `Còn ${diffDays}d ${todo.dueTime ? '(' + todo.dueTime + ')' : ''} ⏰`, type: 'warning', diffDays, targetDate };
    } else {
      return { text: `Còn ${diffDays}d 📅`, type: 'normal', diffDays, targetDate };
    }
  }

  function getTaskPriorityScore(todo) {
    if (!todo || todo.completed) return 999;
    const info = getDeadlineInfo(todo);
    if (!info) return 500; // General tasks without deadline

    if (info.isOverdue) return 10; // Overdue tasks -> Priority 1 (top of list!)
    if (info.isMustStartNow) return 20; // Must start now tasks -> Priority 2!

    if (info.recStartDate) {
      return 100 + (info.recStartDate.getTime() / 10000000000);
    }
    if (info.targetDate) {
      return 200 + (info.targetDate.getTime() / 10000000000);
    }

    return 300;
  }

  function renderTodoList() {
    const activeTodos = todoList.filter(t => !t.completed);
    const completedTodos = todoList.filter(t => t.completed);

    // Sort active todos by urgency & recommended start time:
    // 1. Overdue tasks (fiery red) FIRST
    // 2. Tasks needing immediate start (must-start-now) SECOND
    // 3. Nearest recommended start time / deadline THIRD
    activeTodos.sort((a, b) => {
      const scoreA = getTaskPriorityScore(a);
      const scoreB = getTaskPriorityScore(b);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (elements.todoActiveCount) elements.todoActiveCount.textContent = activeTodos.length;
    if (elements.todoCompletedCount) elements.todoCompletedCount.textContent = completedTodos.length;
    if (elements.todoMainBadge) elements.todoMainBadge.textContent = activeTodos.length;

    if (elements.btnClearCompleted) {
      elements.btnClearCompleted.style.display = completedTodos.length > 0 ? 'block' : 'none';
    }

    elements.todoActiveList.innerHTML = '';
    if (activeTodos.length === 0) {
      elements.todoActiveList.innerHTML = `
        <div class="todo-empty-state">
          ✨ Hết việc rồi! Hãy thêm việc mới để bắt đầu.
        </div>
      `;
    } else {
      activeTodos.forEach((todo, idx) => {
        elements.todoActiveList.appendChild(createTodoItemElement(todo, idx + 1));
      });
    }

    elements.todoCompletedList.innerHTML = '';
    if (completedTodos.length === 0) {
      elements.todoCompletedList.innerHTML = `
        <div class="todo-empty-state">
          📌 Chưa có việc nào hoàn thành.
        </div>
      `;
    } else {
      // Group completed tasks by completion date (lastCompletedDate or today)
      const groupsMap = {};
      const todayStr = getTodayStr();

      completedTodos.forEach(todo => {
        const dateKey = todo.lastCompletedDate || todayStr;
        if (!groupsMap[dateKey]) {
          groupsMap[dateKey] = [];
        }
        groupsMap[dateKey].push(todo);
      });

      // Sort date keys descending (newest dates first)
      const sortedDateKeys = Object.keys(groupsMap).sort((a, b) => b.localeCompare(a));

      sortedDateKeys.forEach((dateKey) => {
        const groupTodos = groupsMap[dateKey];
        groupTodos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const groupDiv = document.createElement('div');
        groupDiv.className = 'completed-date-group';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'completed-group-header';
        
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'group-arrow';
        arrowSpan.textContent = '▼';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'group-title';
        titleSpan.textContent = `📅 ${formatCompletedDateLabel(dateKey)}`;

        const countSpan = document.createElement('span');
        countSpan.className = 'group-count';
        countSpan.textContent = `${groupTodos.length} việc`;

        headerDiv.appendChild(arrowSpan);
        headerDiv.appendChild(titleSpan);
        headerDiv.appendChild(countSpan);

        const listUl = document.createElement('ul');
        listUl.className = 'completed-group-list';

        groupTodos.forEach((todo, idx) => {
          listUl.appendChild(createTodoItemElement(todo, idx + 1));
        });

        // Toggle collapse/expand on header click
        headerDiv.addEventListener('click', () => {
          const isCollapsed = listUl.classList.toggle('collapsed');
          headerDiv.classList.toggle('collapsed', isCollapsed);
        });

        groupDiv.appendChild(headerDiv);
        groupDiv.appendChild(listUl);

        elements.todoCompletedList.appendChild(groupDiv);
      });
    }

    renderTaskViewGrid();
    renderSandwichPlateTimeline();
  }

  function formatCompletedDateLabel(dateStr) {
    if (!dateStr) return 'Ngày khác';
    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();

    const parts = dateStr.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;

    if (dateStr === todayStr) {
      return `Hôm nay (${formattedDate})`;
    } else if (dateStr === yesterdayStr) {
      return `Hôm qua (${formattedDate})`;
    }
    return `Ngày ${formattedDate}`;
  }

  function isDueToday(todo) {
    if (!todo || todo.completed) return false;

    const now = new Date();
    const todayStr = getTodayStr();

    if (todo.isMonthly && todo.repeatMonthDay) {
      return now.getDate() === todo.repeatMonthDay;
    }

    if (todo.isRecurring && Array.isArray(todo.repeatDays)) {
      return todo.repeatDays.includes(now.getDay());
    }

    if (todo.dueDate) {
      return todo.dueDate === todayStr;
    }

    return false;
  }

  function createTodoItemElement(todo, itemIndex) {
    const li = document.createElement('li');
    const deadlineInfo = getDeadlineInfo(todo);
    const isOverdue = deadlineInfo && deadlineInfo.isOverdue && !todo.completed;
    const isMustStart = deadlineInfo && deadlineInfo.isMustStartNow && !todo.completed;
    const dueToday = isDueToday(todo);

    li.className = `todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isMustStart ? 'must-start-now' : ''} ${dueToday && !isOverdue && !isMustStart ? 'due-today' : ''}`;
    li.dataset.todoId = todo.id;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = !!todo.completed;

    const indexBadge = document.createElement('span');
    indexBadge.className = 'todo-index-badge';
    indexBadge.textContent = `#${itemIndex || 1}`;

    const contentBox = document.createElement('div');
    contentBox.className = 'todo-content-box';

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;
    span.style.cursor = 'pointer';
    span.title = 'Bấm để bắt đầu làm việc và chuyển sang bên trái màn hình';
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!todo.completed) {
        toggleTaskTimer(todo.id);
      }
    });
    contentBox.appendChild(span);

    contentBox.style.cursor = 'pointer';
    contentBox.addEventListener('click', (e) => {
      if (e.target === span || e.target.closest('.todo-timer-btn')) return;
      if (!todo.completed) {
        toggleTaskTimer(todo.id);
      }
    });

    // Render Deadline Badge if present and task not completed
    if (deadlineInfo && !todo.completed) {
      const badge = document.createElement('span');
      badge.className = `todo-deadline-badge deadline-${deadlineInfo.type}`;
      badge.textContent = deadlineInfo.text;
      contentBox.appendChild(badge);
    }

    // Render Timer Controls Box
    const timerBox = document.createElement('div');
    timerBox.className = 'todo-timer-box';

    const liveSec = getLiveWorkSeconds(todo);
    const timerBadge = document.createElement('span');
    timerBadge.className = `todo-timer-badge ${todo.timerRunning ? 'active-timing' : (todo.onBreak ? 'on-break' : '')}`;
    timerBadge.textContent = `⏱️ ${formatWorkDuration(liveSec)}`;
    timerBox.appendChild(timerBadge);

    if (!todo.completed) {
      const timerBtn = document.createElement('button');
      timerBtn.type = 'button';
      timerBtn.className = `todo-timer-btn ${todo.timerRunning ? 'running' : ''}`;
      timerBtn.innerHTML = todo.timerRunning ? '⏸️ Tạm dừng' : (todo.onBreak ? '▶️ Tiếp tục' : '▶️ Bắt đầu');
      timerBtn.title = todo.timerRunning ? 'Tạm dừng đếm thời gian' : 'Bắt đầu đếm thời gian thực hiện';
      
      timerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskTimer(todo.id);
      });
      timerBox.appendChild(timerBtn);
    }
    contentBox.appendChild(timerBox);

    // Action Box (Edit & Delete controls)
    const actionBox = document.createElement('div');
    actionBox.className = 'todo-actions-box';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'todo-action-btn edit-btn';
    editBtn.title = 'Sửa công việc này';
    editBtn.innerHTML = '✏️';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'todo-action-btn del-btn';
    delBtn.title = 'Xóa công việc này';
    delBtn.innerHTML = '🗑️';

    actionBox.appendChild(editBtn);
    actionBox.appendChild(delBtn);

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      enterEditMode();
    });

    delBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      todoList = todoList.filter(t => t.id !== todo.id);
      await window.StorageService.saveTodoList(todoList);
      renderTodoList();
      showToast('Đã xóa công việc', '🗑️');
    });

    function enterEditMode() {
      li.classList.add('editing');
      li.innerHTML = ''; // Clear card contents for inline editing

      const editContainer = document.createElement('div');
      editContainer.className = 'todo-edit-container';

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.className = 'todo-edit-text-input';
      textInput.value = todo.text;
      textInput.placeholder = 'Tên công việc...';

      const subRow = document.createElement('div');
      subRow.className = 'todo-edit-sub-row';

      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.value = todo.dueDate || '';
      dateInput.title = 'Sửa ngày hạn chót';

      const timeInput = document.createElement('input');
      timeInput.type = 'time';
      timeInput.value = todo.dueTime || '';
      timeInput.title = 'Sửa giờ hạn chót';

      const estInput = document.createElement('input');
      estInput.type = 'number';
      estInput.value = todo.estMinutes || '';
      estInput.placeholder = 'Dự kiến (m)';
      estInput.title = 'Thời lượng làm dự kiến (phút)';
      estInput.min = '5';
      estInput.max = '1440';
      estInput.style.width = '90px';

      subRow.appendChild(dateInput);
      subRow.appendChild(timeInput);
      subRow.appendChild(estInput);

      const btnsRow = document.createElement('div');
      btnsRow.className = 'todo-edit-btns-row';

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'btn-save-edit';
      saveBtn.innerHTML = '💾 Lưu';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn-cancel-edit';
      cancelBtn.innerHTML = '❌ Hủy';

      btnsRow.appendChild(saveBtn);
      btnsRow.appendChild(cancelBtn);

      editContainer.appendChild(textInput);
      editContainer.appendChild(subRow);
      editContainer.appendChild(btnsRow);

      li.appendChild(editContainer);
      setTimeout(() => textInput.focus(), 50);

      async function saveChanges() {
        const newText = textInput.value.trim();
        if (!newText) {
          showToast('Tên công việc không được để trống!', '⚠️');
          return;
        }
        todo.text = newText;
        todo.dueDate = dateInput.value || null;
        todo.dueTime = timeInput.value || null;
        todo.estMinutes = estInput.value ? parseInt(estInput.value, 10) : null;

        await window.StorageService.saveTodoList(todoList);
        renderTodoList();
        showToast('✏️ Đã cập nhật công việc!', '💾');
      }

      saveBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        saveChanges();
      });

      cancelBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        renderTodoList();
      });

      textInput.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          saveChanges();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          renderTodoList();
        }
      });
    }

    checkbox.addEventListener('change', async () => {
      todo.completed = checkbox.checked;
      if (todo.completed) {
        todo.lastCompletedDate = getTodayStr();
        if (todo.timerRunning) {
          if (todo.lastStartTime) {
            todo.totalWorkSeconds = (todo.totalWorkSeconds || 0) + Math.floor((Date.now() - todo.lastStartTime) / 1000);
          }
          todo.timerRunning = false;
          todo.lastStartTime = null;
        }
        todo.onBreak = false;
      }
      await window.StorageService.saveTodoList(todoList);
      showToast(todo.completed ? '🎉 Đã hoàn thành công việc!' : '🔄 Đã khôi phục công việc', todo.completed ? '✅' : '📋');
      renderTodoList();
    });

    li.appendChild(checkbox);
    if (itemIndex) {
      li.appendChild(indexBadge);
    }
    li.appendChild(contentBox);
    li.appendChild(actionBox);
    return li;
  }

  function bindTodoEvents() {
    if (elements.btnToggleTodoPanel) {
      elements.btnToggleTodoPanel.addEventListener('click', () => {
        const isHidden = elements.todoCardBody.style.display === 'none';
        elements.todoCardBody.style.display = isHidden ? 'flex' : 'none';
      });
    }

    if (elements.btnMinimizeTodo) {
      elements.btnMinimizeTodo.addEventListener('click', () => {
        elements.todoCardBody.style.display = 'none';
      });
    }

    if (elements.tabTodoActive) {
      elements.tabTodoActive.addEventListener('click', () => {
        activeTodoTab = 'active';
        elements.tabTodoActive.classList.add('active');
        elements.tabTodoCompleted.classList.remove('active');
        elements.todoActiveList.style.display = 'flex';
        elements.todoCompletedList.style.display = 'none';
      });
    }

    if (elements.tabTodoCompleted) {
      elements.tabTodoCompleted.addEventListener('click', () => {
        activeTodoTab = 'completed';
        elements.tabTodoCompleted.classList.add('active');
        elements.tabTodoActive.classList.remove('active');
        elements.todoActiveList.style.display = 'none';
        elements.todoCompletedList.style.display = 'flex';
      });
    }

    // Single vs Weekly vs Monthly mode buttons
    if (elements.dailyEfficiencyCard) {
      elements.dailyEfficiencyCard.style.cursor = 'pointer';
      elements.dailyEfficiencyCard.title = 'Bấm để chuyển đổi giữa Hiệu suất Ngày trước và Hôm nay';
      elements.dailyEfficiencyCard.addEventListener('click', () => {
        if (currentEfficiencyMode === 'auto' || currentEfficiencyMode === 'today') {
          currentEfficiencyMode = 'yesterday';
        } else {
          currentEfficiencyMode = 'today';
        }
        updateDailyEfficiencyWidget();
      });
    }

    if (elements.btnToggleAddForm && elements.todoFormContainer) {
      elements.btnToggleAddForm.addEventListener('click', () => {
        const isOpen = elements.todoFormContainer.style.display !== 'none';
        if (isOpen) {
          elements.todoFormContainer.style.display = 'none';
          elements.btnToggleAddForm.classList.remove('active');
          elements.btnToggleAddForm.title = 'Bấm để mở giao diện thêm công việc mới';
        } else {
          elements.todoFormContainer.style.display = 'flex';
          elements.btnToggleAddForm.classList.add('active');
          elements.btnToggleAddForm.title = 'Đóng giao diện thêm công việc';
          if (elements.todoInputText) {
            elements.todoInputText.focus();
          }
        }
      });
    }

    if (elements.btnTypeSingle && elements.btnTypeRecurring) {
      elements.btnTypeSingle.addEventListener('click', () => {
        selectedTaskType = 'single';
        elements.btnTypeSingle.classList.add('active');
        elements.btnTypeRecurring.classList.remove('active');
        if (elements.btnTypeMonthly) elements.btnTypeMonthly.classList.remove('active');
        elements.todoSubSingle.style.display = 'flex';
        elements.todoSubRecurring.style.display = 'none';
        if (elements.todoSubMonthly) elements.todoSubMonthly.style.display = 'none';
      });

      elements.btnTypeRecurring.addEventListener('click', () => {
        selectedTaskType = 'recurring';
        elements.btnTypeRecurring.classList.add('active');
        elements.btnTypeSingle.classList.remove('active');
        if (elements.btnTypeMonthly) elements.btnTypeMonthly.classList.remove('active');
        elements.todoSubSingle.style.display = 'none';
        elements.todoSubRecurring.style.display = 'flex';
        if (elements.todoSubMonthly) elements.todoSubMonthly.style.display = 'none';
      });

      if (elements.btnTypeMonthly) {
        elements.btnTypeMonthly.addEventListener('click', () => {
          selectedTaskType = 'monthly';
          elements.btnTypeMonthly.classList.add('active');
          elements.btnTypeSingle.classList.remove('active');
          elements.btnTypeRecurring.classList.remove('active');
          elements.todoSubSingle.style.display = 'none';
          elements.todoSubRecurring.style.display = 'none';
          if (elements.todoSubMonthly) elements.todoSubMonthly.style.display = 'flex';
        });
      }
    }

    // Weekday picker chips
    if (elements.weekdayPicker) {
      elements.weekdayPicker.querySelectorAll('.day-chip').forEach(chip => {
        const day = parseInt(chip.dataset.day, 10);
        if (selectedWeekdays.has(day)) chip.classList.add('active');

        chip.addEventListener('click', () => {
          if (selectedWeekdays.has(day)) {
            if (selectedWeekdays.size > 1) {
              selectedWeekdays.delete(day);
              chip.classList.remove('active');
            } else {
              showToast('Hãy chọn ít nhất 1 ngày trong tuần!', '⚠️');
            }
          } else {
            selectedWeekdays.add(day);
            chip.classList.add('active');
          }
        });
      });
    }

    if (elements.todoInputForm) {
      elements.todoInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = elements.todoInputText.value.trim();
        if (!text) return;

        let newTodo = null;

        if (selectedTaskType === 'single') {
          const dueDate = elements.todoInputDate ? elements.todoInputDate.value : null;
          const dueTime = elements.todoInputTime ? elements.todoInputTime.value : null;
          const estMinutes = elements.todoInputEstDuration ? parseInt(elements.todoInputEstDuration.value, 10) : null;
          newTodo = {
            id: `todo_${Date.now()}`,
            text,
            isRecurring: false,
            dueDate: dueDate || null,
            dueTime: dueTime || null,
            estMinutes: estMinutes || null,
            completed: false,
            createdAt: Date.now()
          };
        } else if (selectedTaskType === 'monthly') {
          const monthlyTime = elements.todoMonthlyTime ? elements.todoMonthlyTime.value : null;
          const monthDay = elements.todoMonthlyDay ? (parseInt(elements.todoMonthlyDay.value, 10) || 1) : 1;
          const estMinutes = elements.todoInputEstDuration ? parseInt(elements.todoInputEstDuration.value, 10) : null;
          newTodo = {
            id: `todo_month_${Date.now()}`,
            text,
            isRecurring: true,
            isMonthly: true,
            repeatMonthDay: monthDay,
            dueTime: monthlyTime || null,
            estMinutes: estMinutes || null,
            completed: false,
            lastCompletedDate: null,
            createdAt: Date.now()
          };
        } else {
          const recurTime = elements.todoRecurTime ? elements.todoRecurTime.value : null;
          const sortedDays = Array.from(selectedWeekdays).sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
          const estMinutes = elements.todoInputEstDuration ? parseInt(elements.todoInputEstDuration.value, 10) : null;
          newTodo = {
            id: `todo_rec_${Date.now()}`,
            text,
            isRecurring: true,
            repeatDays: sortedDays,
            dueTime: recurTime || null,
            estMinutes: estMinutes || null,
            completed: false,
            lastCompletedDate: null,
            createdAt: Date.now()
          };
        }

        todoList.unshift(newTodo);
        await window.StorageService.saveTodoList(todoList);

        elements.todoInputText.value = '';
        if (elements.todoInputDate) elements.todoInputDate.value = '';
        if (elements.todoInputTime) elements.todoInputTime.value = '';
        if (elements.todoRecurTime) elements.todoRecurTime.value = '';
        if (elements.todoMonthlyTime) elements.todoMonthlyTime.value = '';
        if (elements.todoInputEstDuration) elements.todoInputEstDuration.value = '';

        renderTodoList();
        let toastMsg = 'Đã thêm công việc mới!';
        if (selectedTaskType === 'monthly') toastMsg = 'Đã thêm task lặp lại hàng tháng!';
        else if (selectedTaskType === 'recurring') toastMsg = 'Đã thêm task lặp lại hàng tuần!';
        showToast(toastMsg, '📝');

        // Automatically collapse form after adding task to prioritize task list view
        if (elements.todoFormContainer) {
          elements.todoFormContainer.style.display = 'none';
        }
        if (elements.btnToggleAddForm) {
          elements.btnToggleAddForm.classList.remove('active');
          elements.btnToggleAddForm.title = 'Bấm để mở giao diện thêm công việc mới';
        }
      });
    }

    // Task View Fullscreen Overlay Open / Close
    if (elements.btnExpandTaskView && elements.taskViewOverlay) {
      elements.btnExpandTaskView.addEventListener('click', () => {
        elements.taskViewOverlay.classList.add('active');
        renderTaskViewGrid();
      });
    }

    if (elements.btnTaskViewClose && elements.taskViewOverlay) {
      elements.btnTaskViewClose.addEventListener('click', () => {
        elements.taskViewOverlay.classList.remove('active');
      });
    }

    // 24-Hour Sandwich Timeline Plate Open / Close & Auto-Fix
    if (elements.btnOpenSandwichPlate && elements.sandwichPlateOverlay) {
      elements.btnOpenSandwichPlate.addEventListener('click', () => {
        elements.sandwichPlateOverlay.classList.add('active');
        renderSandwichPlateTimeline();
      });
    }

    if (elements.btnPlateClose && elements.sandwichPlateOverlay) {
      elements.btnPlateClose.addEventListener('click', () => {
        elements.sandwichPlateOverlay.classList.remove('active');
      });
    }

    if (elements.btnAutoFixConflicts) {
      elements.btnAutoFixConflicts.addEventListener('click', autoFixTaskConflicts);
    }

    if (elements.btnQuickAddSandwichTask) {
      elements.btnQuickAddSandwichTask.addEventListener('click', () => quickCreateSandwichTask('09:00'));
    }

    // Alarm Modal Controls
    if (elements.btnAlarmStart) {
      elements.btnAlarmStart.addEventListener('click', () => {
        if (activeAlarmTask) {
          if (elements.taskAlarmModal) elements.taskAlarmModal.classList.remove('active');
          toggleTaskTimer(activeAlarmTask.id);
          showToast('🚀 Đã bắt đầu thực hiện task!', '⚡');
        }
      });
    }

    if (elements.btnAlarmSnooze) {
      elements.btnAlarmSnooze.addEventListener('click', () => {
        if (activeAlarmTask) {
          snoozedTaskUntil[activeAlarmTask.id] = Date.now() + 5 * 60 * 1000; // Snooze for 5 minutes
          if (elements.taskAlarmModal) elements.taskAlarmModal.classList.remove('active');
          showToast('⏱️ Đã hẹn nhắc lại sau 5 phút', '⏰');
        }
      });
    }

    if (elements.btnAlarmClose) {
      elements.btnAlarmClose.addEventListener('click', () => {
        if (elements.taskAlarmModal) elements.taskAlarmModal.classList.remove('active');
      });
    }

    if (elements.btnClearCompleted) {
      elements.btnClearCompleted.addEventListener('click', async () => {
        todoList = todoList.filter(t => !t.completed);
        await window.StorageService.saveTodoList(todoList);
        renderTodoList();
        showToast('Đã xóa toàn bộ việc đã hoàn thành!', '🧹');
      });
    }

    // Top Right Active Task Widget Actions
    if (elements.btnActiveTaskPause) {
      elements.btnActiveTaskPause.addEventListener('click', () => {
        const activeTask = todoList.find(t => (t.timerRunning || t.onBreak) && !t.completed);
        if (activeTask) {
          toggleTaskTimer(activeTask.id);
        }
      });
    }

    if (elements.btnActiveTaskDone) {
      elements.btnActiveTaskDone.addEventListener('click', async () => {
        const activeTask = todoList.find(t => (t.timerRunning || t.onBreak) && !t.completed);
        if (activeTask) {
          activeTask.completed = true;
          activeTask.lastCompletedDate = getTodayStr();
          if (activeTask.timerRunning) {
            if (activeTask.lastStartTime) {
              activeTask.totalWorkSeconds = (activeTask.totalWorkSeconds || 0) + Math.floor((Date.now() - activeTask.lastStartTime) / 1000);
            }
            activeTask.timerRunning = false;
            activeTask.lastStartTime = null;
          }
          activeTask.onBreak = false;

          await window.StorageService.saveTodoList(todoList);
          showToast('🎉 Đã hoàn thành công việc!', '✅');
          renderTodoList();
        }
      });
    }

    // ESC key listener to close modals / task view
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.taskViewOverlay && elements.taskViewOverlay.classList.contains('active')) {
          elements.taskViewOverlay.classList.remove('active');
        }
        if (elements.sandwichPlateOverlay && elements.sandwichPlateOverlay.classList.contains('active')) {
          elements.sandwichPlateOverlay.classList.remove('active');
        }
        if (elements.taskAlarmModal && elements.taskAlarmModal.classList.contains('active')) {
          elements.taskAlarmModal.classList.remove('active');
        }
      }
    });

    // Start 5-second Task Alarm Checking Ticker
    setInterval(checkTaskAlarms, 5000);
  }

  let activeAlarmTask = null;
  const alertedTaskIds = new Set();
  const snoozedTaskUntil = {};

  function playAlarmChimeSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.25);
      gain2.gain.setValueAtTime(0.4, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.warn('AudioContext playback blocked or error:', e);
    }
  }

  function checkTaskAlarms() {
    if (!todoList || todoList.length === 0) return;
    const now = Date.now();

    for (const todo of todoList) {
      if (todo.completed || todo.timerRunning) continue;

      const deadlineInfo = getDeadlineInfo(todo);
      if (deadlineInfo && (deadlineInfo.isMustStartNow || deadlineInfo.isOverdue)) {
        if (snoozedTaskUntil[todo.id] && now < snoozedTaskUntil[todo.id]) continue;
        if (alertedTaskIds.has(todo.id)) continue;

        triggerTaskAlarm(todo);
        break;
      }
    }
  }

  function triggerTaskAlarm(todo) {
    activeAlarmTask = todo;
    alertedTaskIds.add(todo.id);

    if (elements.alarmTaskTitle) elements.alarmTaskTitle.textContent = todo.text;
    if (elements.alarmTaskEst) elements.alarmTaskEst.textContent = todo.estMinutes ? `${todo.estMinutes} phút` : 'Chưa đặt';
    if (elements.alarmTaskDeadline) {
      elements.alarmTaskDeadline.textContent = todo.dueDate ? `${todo.dueDate} ${todo.dueTime || ''}` : 'Trong ngày';
    }

    if (elements.taskAlarmModal) {
      elements.taskAlarmModal.classList.add('active');
      playAlarmChimeSound();
    }
  }

  function renderTaskViewGrid() {
    if (!elements.taskViewOverlay || !elements.taskViewOverlay.classList.contains('active')) return;

    const activeTodos = todoList.filter(t => !t.completed);
    const completedTodos = todoList.filter(t => t.completed);

    const urgentList = [];
    const todayList = [];
    const upcomingList = [];

    activeTodos.forEach(todo => {
      const info = getDeadlineInfo(todo);
      if (info && (info.isOverdue || info.isMustStartNow)) {
        urgentList.push(todo);
      } else if (isDueToday(todo)) {
        todayList.push(todo);
      } else {
        upcomingList.push(todo);
      }
    });

    urgentList.sort((a, b) => getTaskPriorityScore(a) - getTaskPriorityScore(b));
    todayList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    upcomingList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    completedTodos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (elements.tvCountUrgent) elements.tvCountUrgent.textContent = urgentList.length;
    if (elements.tvCountToday) elements.tvCountToday.textContent = todayList.length;
    if (elements.tvCountUpcoming) elements.tvCountUpcoming.textContent = upcomingList.length;
    if (elements.tvCountCompleted) elements.tvCountCompleted.textContent = completedTodos.length;

    if (elements.tvListUrgent) {
      elements.tvListUrgent.innerHTML = urgentList.length === 0 ? '<div class="todo-empty-state">✨ Không có task quá hạn</div>' : '';
      urgentList.forEach((t, i) => elements.tvListUrgent.appendChild(createTodoItemElement(t, i + 1)));
    }

    if (elements.tvListToday) {
      elements.tvListToday.innerHTML = todayList.length === 0 ? '<div class="todo-empty-state">✨ Không có task trong ngày</div>' : '';
      todayList.forEach((t, i) => elements.tvListToday.appendChild(createTodoItemElement(t, i + 1)));
    }

    if (elements.tvListUpcoming) {
      elements.tvListUpcoming.innerHTML = upcomingList.length === 0 ? '<div class="todo-empty-state">✨ Chưa có task sắp tới</div>' : '';
      upcomingList.forEach((t, i) => elements.tvListUpcoming.appendChild(createTodoItemElement(t, i + 1)));
    }

    if (elements.tvListCompleted) {
      elements.tvListCompleted.innerHTML = completedTodos.length === 0 ? '<div class="todo-empty-state">📌 Chưa có task hoàn thành</div>' : '';
      completedTodos.forEach((t, i) => elements.tvListCompleted.appendChild(createTodoItemElement(t, i + 1)));
    }
  }

  function renderSandwichPlateTimeline() {
    if (!elements.sandwichPlateOverlay || !elements.sandwichPlateOverlay.classList.contains('active')) return;

    // 1. Render Ruler (00:00 -> 23:00)
    if (elements.timelineRuler) {
      elements.timelineRuler.innerHTML = '';
      for (let h = 0; h < 24; h++) {
        const tick = document.createElement('div');
        tick.className = 'timeline-tick';
        tick.textContent = `${String(h).padStart(2, '0')}:00`;
        elements.timelineRuler.appendChild(tick);
      }
    }

    // 2. Position Current Time Line
    if (elements.timelineNowLine) {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const pct = (currentMin / 1440) * 100;
      elements.timelineNowLine.style.left = `${pct}%`;
    }

    // 3. Categorize active tasks: Scheduled vs Unscheduled
    const activeTodos = todoList.filter(t => !t.completed && isDueToday(t));
    const scheduled = [];
    const unscheduled = [];

    activeTodos.forEach(todo => {
      if (todo.dueTime) {
        const parts = todo.dueTime.split(':');
        const startMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        const estMin = todo.estMinutes || 30;
        scheduled.push({
          todo,
          startMin,
          estMin,
          endMin: startMin + estMin
        });
      } else {
        unscheduled.push(todo);
      }
    });

    // 4. Conflict Detection Engine
    let hasConflict = false;
    const conflictMessages = [];
    const conflictTaskIds = new Set();

    for (let i = 0; i < scheduled.length; i++) {
      for (let j = i + 1; j < scheduled.length; j++) {
        const itemA = scheduled[i];
        const itemB = scheduled[j];
        if (itemA.startMin < itemB.endMin && itemB.startMin < itemA.endMin) {
          hasConflict = true;
          conflictTaskIds.add(itemA.todo.id);
          conflictTaskIds.add(itemB.todo.id);

          const startAStr = formatMinToTime(itemA.startMin);
          const endAStr = formatMinToTime(itemA.endMin);
          const startBStr = formatMinToTime(itemB.startMin);
          const endBStr = formatMinToTime(itemB.endMin);

          conflictMessages.push(`⚠️ "${itemA.todo.text}" (${startAStr}-${endAStr}) bị trùng giờ với "${itemB.todo.text}" (${startBStr}-${endBStr})`);
        }
      }
    }

    // 5. Update Conflict Banner
    if (elements.sandwichConflictBanner && elements.sandwichConflictText) {
      if (hasConflict) {
        elements.sandwichConflictBanner.style.display = 'flex';
        elements.sandwichConflictText.innerHTML = conflictMessages.join(' | ');
      } else {
        elements.sandwichConflictBanner.style.display = 'none';
      }
    }

    // 6. Render Scheduled Task Slices on Timeline Track with Pointer Dragging
    if (elements.timelineTrack) {
      elements.timelineTrack.innerHTML = '';
      scheduled.forEach(item => {
        const slice = document.createElement('div');
        const isConflicting = conflictTaskIds.has(item.todo.id);
        slice.className = `sandwich-slice ${isConflicting ? 'conflict' : ''}`;

        const leftPct = (item.startMin / 1440) * 100;
        const widthPct = Math.max((item.estMin / 1440) * 100, 2.5);
        slice.style.left = `${leftPct}%`;
        slice.style.width = `${widthPct}%`;

        const startTimeStr = formatMinToTime(item.startMin);
        const endTimeStr = formatMinToTime(item.endMin);

        slice.innerHTML = `
          <div class="sandwich-slice-header">
            <span class="sandwich-slice-title" title="${item.todo.text}">${item.todo.text}</span>
            <span class="sandwich-slice-time">⏰ ${startTimeStr} - ${endTimeStr}</span>
          </div>
          <div class="sandwich-slice-footer">
            <span>⏱️ ${item.estMin}m</span>
            <span>${isConflicting ? '⚠️ Xung đột' : '✅ Hợp lý'}</span>
          </div>
        `;

        // Pointer Dragging for Slice
        let startPointerX = 0;
        let initialStartMin = item.startMin;
        let isDragging = false;
        let hasMoved = false;

        slice.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          startPointerX = e.clientX;
          initialStartMin = item.startMin;
          isDragging = true;
          hasMoved = false;
          slice.setPointerCapture(e.pointerId);
          slice.style.transition = 'none';
        });

        slice.addEventListener('pointermove', (e) => {
          if (!isDragging) return;
          const deltaX = e.clientX - startPointerX;
          if (Math.abs(deltaX) > 4) hasMoved = true;

          const trackWidth = elements.timelineTrackContainer.clientWidth || 1440;
          const deltaMin = (deltaX / trackWidth) * 1440;
          let newStartMin = Math.max(0, Math.min(1440 - item.estMin, Math.round((initialStartMin + deltaMin) / 5) * 5));

          const newLeftPct = (newStartMin / 1440) * 100;
          slice.style.left = `${newLeftPct}%`;

          const newStartStr = formatMinToTime(newStartMin);
          const newEndStr = formatMinToTime(newStartMin + item.estMin);
          const timeBadge = slice.querySelector('.sandwich-slice-time');
          if (timeBadge) timeBadge.textContent = `⏰ ${newStartStr} - ${newEndStr}`;
        });

        const handlePointerEnd = async (e) => {
          if (!isDragging) return;
          isDragging = false;
          try { slice.releasePointer(e.pointerId); } catch (err) {}
          slice.style.transition = '';

          if (hasMoved) {
            const deltaX = e.clientX - startPointerX;
            const trackWidth = elements.timelineTrackContainer.clientWidth || 1440;
            const deltaMin = (deltaX / trackWidth) * 1440;
            let newStartMin = Math.max(0, Math.min(1440 - item.estMin, Math.round((initialStartMin + deltaMin) / 5) * 5));

            item.todo.dueTime = formatMinToTime(newStartMin);
            if (!item.todo.dueDate) item.todo.dueDate = getTodayStr();

            await window.StorageService.saveTodoList(todoList);
            renderTodoList();
            renderSandwichPlateTimeline();
            showToast(`📍 Đã xếp task "${item.todo.text}" vào khung giờ ${item.todo.dueTime}`, '🥪');
          } else {
            promptAdjustTaskTime(item.todo);
          }
        };

        slice.addEventListener('pointerup', handlePointerEnd);
        slice.addEventListener('pointercancel', handlePointerEnd);

        elements.timelineTrack.appendChild(slice);
      });
    }

    // Click on empty track area to create task directly at clicked time
    if (elements.timelineTrackContainer && !elements.timelineTrackContainer.dataset.clickBound) {
      elements.timelineTrackContainer.dataset.clickBound = 'true';
      elements.timelineTrackContainer.addEventListener('click', (e) => {
        if (e.target.closest('.sandwich-slice')) return;

        const rect = elements.timelineTrackContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const clickedMin = Math.round((pct * 1440) / 15) * 15;

        const timeStr = formatMinToTime(clickedMin);
        quickCreateSandwichTask(timeStr);
      });
    }

    // 7. Render Unscheduled Tray
    if (elements.unscheduledSlicesList) {
      elements.unscheduledSlicesList.innerHTML = unscheduled.length === 0 
        ? '<span class="text-muted" style="font-size: 0.8rem;">✨ Tất cả công việc trong ngày đã có khung giờ cụ thể!</span>'
        : '';

      unscheduled.forEach(todo => {
        const chip = document.createElement('div');
        chip.className = 'unscheduled-chip';
        chip.innerHTML = `<span>📋 ${todo.text}</span> <span>(${todo.estMinutes || 30}m)</span> <strong>+ Gán giờ</strong>`;
        chip.addEventListener('click', () => {
          promptAdjustTaskTime(todo);
        });
        elements.unscheduledSlicesList.appendChild(chip);
      });
    }
  }

  function formatMinToTime(minutes) {
    const m = Math.max(0, Math.min(1439, minutes));
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  async function promptAdjustTaskTime(todo) {
    const current = todo.dueTime || '09:00';
    const input = prompt(`Nhập thời điểm bắt đầu cho "${todo.text}" (Định dạng HH:mm, ví dụ 09:30, 14:00):`, current);
    if (input && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input.trim())) {
      todo.dueTime = input.trim();
      if (!todo.dueDate) todo.dueDate = getTodayStr();
      await window.StorageService.saveTodoList(todoList);
      renderTodoList();
      renderSandwichPlateTimeline();
      showToast(`Đã gán giờ ${todo.dueTime} cho task "${todo.text}"`, '⏰');
    }
  }

  async function quickCreateSandwichTask(defaultTimeStr = '09:00') {
    const taskName = prompt(`⏳ Thêm công việc mới trên Timeline 24h (Bắt đầu lúc ${defaultTimeStr}):`, '');
    if (!taskName || !taskName.trim()) return;

    const estDurationStr = prompt(`Dự kiến làm "${taskName.trim()}" bao nhiêu phút? (Ví dụ: 30, 45, 60):`, '30');
    const estMinutes = parseInt(estDurationStr, 10) || 30;

    const newTodo = {
      id: `todo_${Date.now()}`,
      text: taskName.trim(),
      isRecurring: false,
      isMonthly: false,
      dueDate: getTodayStr(),
      dueTime: defaultTimeStr,
      estMinutes: estMinutes,
      completed: false,
      createdAt: Date.now()
    };

    todoList.unshift(newTodo);
    await window.StorageService.saveTodoList(todoList);

    renderTodoList();
    renderSandwichPlateTimeline();
    showToast(`🎉 Đã thêm task "${newTodo.text}" vào Timeline 24h lúc ${defaultTimeStr}!`, '⏳');
  }

  async function autoFixTaskConflicts() {
    const activeToday = todoList.filter(t => !t.completed && isDueToday(t) && t.dueTime);

    if (activeToday.length === 0) {
      showToast('Không có task nào bị trùng giờ!', '✨');
      return;
    }

    const items = activeToday.map(todo => {
      const parts = todo.dueTime.split(':');
      const startMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      const estMin = todo.estMinutes || 30;
      return { todo, startMin, estMin };
    }).sort((a, b) => a.startMin - b.startMin);

    let currentPointer = items[0].startMin;
    let fixedCount = 0;

    items.forEach(item => {
      if (item.startMin < currentPointer) {
        item.startMin = currentPointer;
        item.todo.dueTime = formatMinToTime(item.startMin);
        fixedCount++;
      }
      currentPointer = item.startMin + item.estMin;
    });

    if (fixedCount > 0) {
      await window.StorageService.saveTodoList(todoList);
      renderTodoList();
      renderSandwichPlateTimeline();
      showToast(`⚡ Đã tự động xếp nối tiếp ${fixedCount} task tránh bị trùng giờ!`, '🎉');
    } else {
      showToast('✨ Tất cả các task đã ở khung giờ hợp lý, không bị trùng!', '✅');
    }
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */

  function showToast(message, icon = '💡') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* ==========================================================================
     Event Listeners Binding
     ========================================================================== */

  function bindEvents() {
    // Tip Actions
    elements.btnNextTip.addEventListener('click', showNextTip);
    elements.btnFavTip.addEventListener('click', toggleFavoriteCurrentTip);
    elements.btnCopyTip.addEventListener('click', () => copyCurrentTip(false));
    elements.btnShareTip.addEventListener('click', () => copyCurrentTip(true));
    elements.btnSpeakTip.addEventListener('click', toggleSpeech);

    // Search
    elements.searchForm.addEventListener('submit', handleSearchSubmit);
    elements.searchInput.addEventListener('input', () => {
      elements.btnClearSearch.classList.toggle('visible', elements.searchInput.value.length > 0);
    });
    elements.btnClearSearch.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.btnClearSearch.classList.remove('visible');
      elements.searchInput.focus();
    });

    // Category Filter Chips
    elements.categoryChipsBar.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        elements.categoryChipsBar.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategoryFilter = chip.dataset.cat;
        showNextTip();
      });
    });

    // Favorites Drawer
    elements.btnOpenFavorites.addEventListener('click', openFavoritesDrawer);
    elements.btnCloseFavDrawer.addEventListener('click', closeFavoritesDrawer);
    elements.favDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === elements.favDrawerOverlay) closeFavoritesDrawer();
    });

    elements.tabSavedTips.addEventListener('click', () => {
      activeDrawerTab = 'saved';
      elements.tabSavedTips.classList.add('active');
      elements.tabCustomTips.classList.remove('active');
      renderDrawerList();
    });

    elements.tabCustomTips.addEventListener('click', () => {
      activeDrawerTab = 'custom';
      elements.tabCustomTips.classList.add('active');
      elements.tabSavedTips.classList.remove('active');
      renderDrawerList();
    });

    elements.favSearchInput.addEventListener('input', renderDrawerList);
    elements.btnExportTips.addEventListener('click', exportData);
    elements.importFileInput.addEventListener('change', handleImportFile);

    // Add Custom Tip Modal
    elements.btnAddCustomTipTop.addEventListener('click', () => openModal(elements.customTipModal));
    elements.btnOpenCreateModal.addEventListener('click', () => openModal(elements.customTipModal));
    elements.btnCloseCustomModal.addEventListener('click', () => closeModal(elements.customTipModal));
    elements.btnCancelCustom.addEventListener('click', () => closeModal(elements.customTipModal));

    elements.customTipForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = elements.customTitle.value.trim();
      const category = elements.customCategory.value;
      const catNames = {
        productivity: '⚡ Năng suất',
        '5s': '🧹 5S Văn Phòng',
        safety: '🦺 An Toàn Lao Động',
        tech: '💻 Công nghệ',
        health: '🧘 Sức khỏe',
        finance: '💰 Tài chính',
        life: '🏠 Đời sống',
        mindset: '🧠 Tâm lý'
      };
      const content = elements.customContent.value.trim();
      const action = elements.customAction.value.trim();
      const tags = elements.customTags.value.split(',').map(t => t.trim()).filter(Boolean);

      const newTip = {
        id: `custom_${Date.now()}`,
        category,
        categoryName: catNames[category] || '✨ Tự tạo',
        title,
        content,
        action: action ? (action.startsWith('👉') ? action : `👉 ${action}`) : '',
        tags: tags.length > 0 ? tags : ['#custom'],
        isCustom: true
      };

      const updated = [newTip, ...tipManager.customTips];
      tipManager.setCustomTips(updated);
      await window.StorageService.saveCustomTips(updated);

      elements.customTipForm.reset();
      closeModal(elements.customTipModal);
      updateFavoritesBadge();
      renderTip(newTip);
      showToast('Đã thêm mẹo tự tạo thành công!', '✨');
    });

    // Add Shortcut Modal
    elements.btnCloseShortcutModal.addEventListener('click', () => closeModal(elements.shortcutModal));
    elements.btnCancelShortcut.addEventListener('click', () => closeModal(elements.shortcutModal));
    elements.shortcutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = elements.shortcutTitle.value.trim();
      const url = elements.shortcutUrl.value.trim();
      const icon = elements.shortcutIcon.value.trim() || '🌐';

      const newShortcut = {
        id: `sc_${Date.now()}`,
        title,
        url: url.startsWith('http') ? url : `https://${url}`,
        icon
      };

      currentSettings.shortcuts = [...(currentSettings.shortcuts || []), newShortcut];
      await window.StorageService.saveSettings(currentSettings);
      renderShortcuts();
      elements.shortcutForm.reset();
      closeModal(elements.shortcutModal);
      showToast('Đã thêm lối tắt mới!', '🔗');
    });

    // Settings Modal
    elements.btnOpenSettings.addEventListener('click', () => {
      populateSettingsModal();
      openModal(elements.settingsModal);
    });
    elements.btnCloseSettings.addEventListener('click', () => closeModal(elements.settingsModal));
    elements.btnSaveSettingsModal.addEventListener('click', saveSettingsFromModal);

    // Backup, Restore & Auto Upgrade in Settings
    const btnAutoBackupAndUpgrade = document.getElementById('btnAutoBackupAndUpgrade');
    const btnExportSettings = document.getElementById('btnExportSettings');
    const importSettingsFileInput = document.getElementById('importSettingsFileInput');

    if (btnAutoBackupAndUpgrade) {
      btnAutoBackupAndUpgrade.addEventListener('click', handleAutoBackupAndUpgrade);
    }

    if (btnExportSettings) {
      btnExportSettings.addEventListener('click', exportSettingsJSON);
    }

    if (importSettingsFileInput) {
      importSettingsFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          handleImportJSONFile(file);
          e.target.value = '';
        }
      });
    }

    // Upgrade Guide Modal Controls
    const upgradeGuideModal = document.getElementById('upgradeGuideModal');
    const btnCloseUpgradeModal = document.getElementById('btnCloseUpgradeModal');
    const btnFinishUpgradeGuide = document.getElementById('btnFinishUpgradeGuide');

    if (btnCloseUpgradeModal && upgradeGuideModal) {
      btnCloseUpgradeModal.addEventListener('click', () => closeModal(upgradeGuideModal));
    }
    if (btnFinishUpgradeGuide && upgradeGuideModal) {
      btnFinishUpgradeGuide.addEventListener('click', () => closeModal(upgradeGuideModal));
    }

    // Settings Theme Selector (Live click preview)
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const theme = btn.dataset.theme;
        currentSettings.theme = theme;
        applyTheme(theme);
        await window.StorageService.saveSettings(currentSettings);
      });
    });

    // Reset settings
    elements.btnResetSettings.addEventListener('click', async () => {
      if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt về mặc định?')) {
        currentSettings = { ...window.DEFAULT_SETTINGS };
        await window.StorageService.saveSettings(currentSettings);
        applyTheme(currentSettings.theme);
        applyWidgetVisibility();
        setupSearchEngineDisplay();
        renderShortcuts();
        closeModal(elements.settingsModal);
        showToast('Đã khôi phục cài đặt gốc!', '🔄');
      }
    });
  }

  /* ==========================================================================
     Backup & Upgrade Functions
     ========================================================================== */

  async function exportSettingsJSON() {
    try {
      const data = {
        app: 'Life Hacks New Tab',
        version: (chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : '1.0.0',
        exportedAt: new Date().toISOString(),
        settings: currentSettings,
        todoList: todoList || [],
        dailyWorkHistory: (await window.StorageService.getDailyWorkHistory()) || [],
        customTips: (tipManager && tipManager.customTips) ? tipManager.customTips : [],
        savedTips: (tipManager && tipManager.savedTips) ? tipManager.savedTips : []
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const d = new Date();
      const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
      const fileName = `life-hacks-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`📤 Đã tự động sao lưu dữ liệu ra ${fileName}!`, '💾');
      return fileName;
    } catch (err) {
      console.error('Error exporting settings JSON:', err);
      showToast('⚠️ Không thể xuất dữ liệu sao lưu!', '❌');
    }
  }

  async function handleAutoBackupAndUpgrade() {
    // Step 1: Auto backup JSON data
    await exportSettingsJSON();

    // Step 2: Download latest release zip package
    const zipUrl = 'https://github.com/H2o86/life-hacks-new-tab/archive/refs/heads/main.zip';
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'life-hacks-new-tab-main.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Step 3: Open step-by-step Upgrade Guide Modal
    const upgradeGuideModal = document.getElementById('upgradeGuideModal');
    if (upgradeGuideModal) {
      openModal(upgradeGuideModal);
    }
  }

  async function handleImportJSONFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.settings) {
        currentSettings = { ...window.DEFAULT_SETTINGS, ...data.settings };
        await window.StorageService.saveSettings(currentSettings);
        applyTheme(currentSettings.theme);
        applyWidgetVisibility();
        setupSearchEngineDisplay();
        renderShortcuts();
      }

      if (Array.isArray(data.todoList)) {
        todoList = data.todoList;
        await window.StorageService.saveTodoList(todoList);
        renderTodoList();
      }

      if (Array.isArray(data.customTips) && tipManager) {
        tipManager.setCustomTips(data.customTips);
        await window.StorageService.saveCustomTips(data.customTips);
      }

      if (Array.isArray(data.savedTips) && tipManager) {
        tipManager.setSavedTips(data.savedTips);
        await window.StorageService.saveSavedTips(data.savedTips);
      }

      if (Array.isArray(data.dailyWorkHistory)) {
        await window.StorageService.saveDailyWorkHistory(data.dailyWorkHistory);
        updateDailyEfficiencyWidget();
      }

      showToast('🎉 Nhập dữ liệu sao lưu thành công!', '✅');
      if (elements.settingsModal) closeModal(elements.settingsModal);
    } catch (err) {
      console.error('Error importing settings JSON:', err);
      showToast('❌ File JSON không hợp lệ hoặc bị lỗi!', '⚠️');
    }
  }

  /* ==========================================================================
     Keyboard Shortcuts
     ========================================================================== */

  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore shortcut if user is typing in an input or textarea
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyN':
          e.preventDefault();
          showNextTip();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFavoriteCurrentTip();
          break;
        case 'KeyC':
          e.preventDefault();
          copyCurrentTip(false);
          break;
        case 'KeyS':
          e.preventDefault();
          populateSettingsModal();
          openModal(elements.settingsModal);
          break;
        case 'KeyB':
          e.preventDefault();
          openFavoritesDrawer();
          break;
        case 'Slash':
          e.preventDefault();
          if (elements.searchInput) {
            elements.searchInput.focus();
            elements.searchInput.select();
          }
          break;
        case 'Escape':
          closeFavoritesDrawer();
          closeModal(elements.customTipModal);
          closeModal(elements.settingsModal);
          closeModal(elements.shortcutModal);
          break;
      }
    });
  }

  // Start app on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
