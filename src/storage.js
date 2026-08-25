/**
 * Storage Helper for Life Hacks New Tab Extension
 * Supports chrome.storage.sync, chrome.storage.local, and localStorage fallback.
 */

const DEFAULT_SETTINGS = {
  theme: 'cyber-dark', // 'cyber-dark' | 'clean-light' | 'aurora-gradient' | 'nature-zen' | 'oled-black'
  tipMode: 'random',   // 'random' | 'daily'
  selectedCategories: ['productivity', 'tech', 'health', 'finance', 'life', 'mindset'],
  autoFetchOnline: true, // Tự động tìm thêm mẹo mới từ Internet
  showClock: true,
  showGreeting: true,
  showSearch: true,
  showShortcuts: true,
  showShortcutsHint: true,
  showPomodoro: true,
  showTodoList: true,
  searchEngine: 'google', // 'google' | 'bing' | 'duckduckgo' | 'brave' | 'ecosia' | 'youtube'
  language: 'vi',
  shortcuts: [
    { id: 'sc_1', title: 'Google', url: 'https://www.google.com', icon: '🔍' },
    { id: 'sc_2', title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
    { id: 'sc_3', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: 'sc_4', title: 'ChatGPT', url: 'https://chatgpt.com', icon: '🤖' },
    { id: 'sc_5', title: 'Gmail', url: 'https://mail.google.com', icon: '✉️' }
  ]
};

const StorageService = {
  isChromeStorageAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;
  },

  async getSettings() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['settings'], (result) => {
          if (result && result.settings) {
            resolve({ ...DEFAULT_SETTINGS, ...result.settings });
          } else {
            resolve({ ...DEFAULT_SETTINGS });
          }
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_settings');
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
      } catch (e) {
        return { ...DEFAULT_SETTINGS };
      }
    }
  },

  async saveSettings(settings) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ settings }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_settings', JSON.stringify(settings));
      return true;
    }
  },

  async getFavorites() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['favorites'], (result) => {
          resolve(result.favorites || []);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_favorites');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async saveFavorites(favorites) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ favorites }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_favorites', JSON.stringify(favorites));
      return true;
    }
  },

  async getCustomTips() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['customTips'], (result) => {
          resolve(result.customTips || []);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_custom_tips');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async saveCustomTips(customTips) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ customTips }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_custom_tips', JSON.stringify(customTips));
      return true;
    }
  },

  async getCachedOnlineTips() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['cachedOnlineTips'], (result) => {
          resolve(result.cachedOnlineTips || []);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_cached_online_tips');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async saveCachedOnlineTips(cachedOnlineTips) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ cachedOnlineTips }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_cached_online_tips', JSON.stringify(cachedOnlineTips));
      return true;
    }
  },

  async getViewedTipIds() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['viewedTipIds'], (result) => {
          resolve(result.viewedTipIds || []);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_viewed_ids');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async saveViewedTipIds(viewedTipIds) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ viewedTipIds }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_viewed_ids', JSON.stringify(viewedTipIds));
      return true;
    }
  },

  async getTodoList() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['todoList'], (result) => {
          resolve(result.todoList || []);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_todolist');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async saveTodoList(todoList) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ todoList }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_todolist', JSON.stringify(todoList));
      return true;
    }
  },

  async getPomodoroState() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['pomodoroState'], (result) => {
          resolve(result.pomodoroState || null);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_pomodoro_state');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }
  },

  async savePomodoroState(pomodoroState) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ pomodoroState }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_pomodoro_state', JSON.stringify(pomodoroState));
      return true;
    }
  },

  async getDailyWorkHistory() {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['dailyWorkHistory'], (result) => {
          resolve(result.dailyWorkHistory || {});
        });
      });
    } else {
      try {
        const raw = localStorage.getItem('lifehacks_daily_work_history');
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }
  },

  async saveDailyWorkHistory(dailyWorkHistory) {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ dailyWorkHistory }, () => resolve(true));
      });
    } else {
      localStorage.setItem('lifehacks_daily_work_history', JSON.stringify(dailyWorkHistory));
      return true;
    }
  }
};

window.StorageService = StorageService;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
