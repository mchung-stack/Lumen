import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sopCategories as defaultSopCategories } from '../data/sopDatabase';

// --- localStorage helpers ---
const DATA_VERSION = 5; // bump when default data structure changes significantly
const VERSION_KEY = 'adulthood_dataVersion';
const LS_KEYS = {
  sopCategories: 'adulthood_sopCategories_v2',
  reminders: 'adulthood_reminders_v2',
  habits: 'adulthood_habits_v2',
  quickStats: 'adulthood_quickStats_v2',
  budget: 'adulthood_budget_v2',
  healthLogs: 'adulthood_healthLogs_v2',
  calendarEvents: 'adulthood_calendarEvents_v1',
};

// clear old-version localStorage keys to force re-init with new HK defaults
function migrateIfNeeded() {
  try {
    const storedVersion = parseInt(localStorage.getItem(VERSION_KEY), 10);
    if (storedVersion >= DATA_VERSION) return; // already up to date
    // Remove old keys so fresh HK data loads
    Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
  } catch (_) {}
}

function loadFromLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed; // support both arrays and objects
    }
  } catch (_) {}
  return fallback;
}

function saveToLS(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

// --- Default fallbacks ---
const getDefaultReminders = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  return [
    { id: 1, type: 'maintenance', title: '冷氣濾網清潔', category: '家居', dueDate: '每月 15 日', priority: 'high', icon: '❄️', completed: day > 15 },
    { id: 2, type: 'bill', title: '電費帳單繳費', category: '財務', dueDate: `每月 ${day + 3} 日`, priority: 'high', icon: '⚡', completed: false },
    { id: 3, type: 'health', title: '體重記錄', category: '健康', dueDate: '每日', priority: 'medium', icon: '⚖️', completed: day % 2 === 0 },
    { id: 4, type: 'maintenance', title: '洗衣機槽清潔', category: '家居', dueDate: '每季 1 日', priority: 'medium', icon: '🧺', completed: month % 3 !== 0 },
    { id: 5, type: 'social', title: '媽媽生日倒數 5 天', category: '人際', dueDate: `${month + 1}/${day + 5}`, priority: 'high', icon: '🎂', completed: false },
    { id: 6, type: 'inventory', title: '衛生紙庫存偏低', category: '家居', dueDate: '需補充', priority: 'medium', icon: '🧻', completed: false },
    { id: 7, type: 'bill', title: '管理費繳交', category: '財務', dueDate: '每月 10 日', priority: 'high', icon: '🏢', completed: day > 10 },
    { id: 8, type: 'health', title: '眼科回診', category: '健康', dueDate: `${month + 1}/28 14:30`, priority: 'high', icon: '👁️', completed: false },
  ];
};

const getDefaultHabits = () => [
  { id: 1, name: '喝水 2000ml', icon: '💧', progress: 70, target: 2000, unit: 'ml', current: 1400, step: 100 },
  { id: 2, name: '閱讀 30 分鐘', icon: '📖', progress: 100, target: 30, unit: 'min', current: 30, step: 5 },
  { id: 3, name: '早睡 (23:00前)', icon: '🌙', progress: 0, target: 1, unit: '', current: 0, step: 1 },
  { id: 4, name: '運動 20 分鐘', icon: '🏃', progress: 50, target: 20, unit: 'min', current: 10, step: 5 },
  { id: 5, name: '冥想 10 分鐘', icon: '🧘', progress: 100, target: 10, unit: 'min', current: 10, step: 5 },
];

const getDefaultQuickStats = () => [
  { id: 'stats-1', label: '待辦事項', value: '5', change: '+2', icon: '📋' },
  { id: 'stats-2', label: '本月儲蓄', value: 'HK$8,500', change: '+12%', icon: '💰' },
  { id: 'stats-3', label: '習慣連續', value: '7 天', change: '🔥', icon: '🔥' },
  { id: 'stats-4', label: '即將到期', value: '3 項', change: '⚠️', icon: '⏰' },
];

const getDefaultBudget = () => ({
  monthlyIncome: 25000,
  expenses: [
    { id: 'exp-1', category: '租金／供樓', amount: 12000 },
    { id: 'exp-2', category: '飲食', amount: 5000 },
    { id: 'exp-3', category: '交通', amount: 1500 },
    { id: 'exp-4', category: '水電煤', amount: 1200 },
    { id: 'exp-5', category: '娛樂', amount: 2000 },
    { id: 'exp-6', category: '保險', amount: 1500 },
    { id: 'exp-7', category: '其他', amount: 800 },
  ],
});

const getDefaultCalendarEvents = () => [
  { id: 'ce-1', name: '爸爸', date: '03-10', type: 'birthday', year: null, note: '' },
  { id: 'ce-2', name: '媽媽', date: '06-15', type: 'birthday', year: null, note: '記得買蛋糕' },
  { id: 'ce-3', name: '好兄弟阿傑', date: '08-22', type: 'birthday', year: null, note: '' },
  { id: 'ce-4', name: '結婚紀念日', date: '12-01', type: 'anniversary', year: '2018', note: '訂浪漫餐廳' },
];

const getDefaultHealthLogs = () => {
  const today = new Date();
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return [
    { id: 'hl-1', type: '體重', value: '68', unit: 'kg', date: fmt(new Date(today.getTime() - 6 * 86400000)), note: '早晨空腹' },
    { id: 'hl-2', type: '體重', value: '67.5', unit: 'kg', date: fmt(new Date(today.getTime() - 3 * 86400000)), note: '' },
    { id: 'hl-3', type: '血壓', value: '118/78', unit: 'mmHg', date: fmt(new Date(today.getTime() - 2 * 86400000)), note: '早晨' },
    { id: 'hl-4', type: '腰圍', value: '82', unit: 'cm', date: fmt(new Date(today.getTime() - 14 * 86400000)), note: '' },
  ];
};

// --- Context ---
const AppDataContext = createContext(null);

let nextId = Date.now();
function genId() {
  return String(++nextId);
}

export function AppDataProvider({ children }) {
  // run migration once before reading data
  const initialized = React.useRef(false);
  if (!initialized.current) {
    migrateIfNeeded();
    initialized.current = true;
  }

  const [sopCategories, setSopCategories] = useState(() =>
    loadFromLS(LS_KEYS.sopCategories, defaultSopCategories)
  );
  const [reminders, setReminders] = useState(() =>
    loadFromLS(LS_KEYS.reminders, getDefaultReminders())
  );
  const [habits, setHabits] = useState(() =>
    loadFromLS(LS_KEYS.habits, getDefaultHabits())
  );
  const [quickStats, setQuickStats] = useState(() =>
    loadFromLS(LS_KEYS.quickStats, getDefaultQuickStats())
  );
  const [budget, setBudget] = useState(() =>
    (() => { const d = loadFromLS(LS_KEYS.budget, null); return d && d.monthlyIncome !== undefined ? d : getDefaultBudget(); })()
  );
  const [healthLogs, setHealthLogs] = useState(() =>
    loadFromLS(LS_KEYS.healthLogs, getDefaultHealthLogs())
  );
  const [calendarEvents, setCalendarEvents] = useState(() =>
    loadFromLS(LS_KEYS.calendarEvents, getDefaultCalendarEvents())
  );

  // Persist
  useEffect(() => { saveToLS(LS_KEYS.sopCategories, sopCategories); }, [sopCategories]);
  useEffect(() => { saveToLS(LS_KEYS.reminders, reminders); }, [reminders]);
  useEffect(() => { saveToLS(LS_KEYS.habits, habits); }, [habits]);
  useEffect(() => { saveToLS(LS_KEYS.quickStats, quickStats); }, [quickStats]);
  useEffect(() => { saveToLS(LS_KEYS.budget, budget); }, [budget]);
  useEffect(() => { saveToLS(LS_KEYS.healthLogs, healthLogs); }, [healthLogs]);
  useEffect(() => { saveToLS(LS_KEYS.calendarEvents, calendarEvents); }, [calendarEvents]);

  // Reset all data to defaults
  const resetAll = useCallback(() => {
    setSopCategories(defaultSopCategories);
    setReminders(getDefaultReminders());
    setHabits(getDefaultHabits());
    setQuickStats(getDefaultQuickStats());
    setBudget(getDefaultBudget());
    setHealthLogs(getDefaultHealthLogs());
    setCalendarEvents(getDefaultCalendarEvents());
  }, []);

  // ========================
  //  SOP Category CRUD
  // ========================
  const updateCategory = useCallback((catId, updates) => {
    setSopCategories(prev =>
      prev.map(cat => cat.id === catId ? { ...cat, ...updates } : cat)
    );
  }, []);

  const addSection = useCallback((catId, section) => {
    setSopCategories(prev =>
      prev.map(cat =>
        cat.id === catId
          ? { ...cat, sections: [...cat.sections, { ...section, items: [] }] }
          : cat
      )
    );
  }, []);

  const updateSection = useCallback((catId, sIdx, updates) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        const sections = cat.sections.map((s, i) => (i === sIdx ? { ...s, ...updates } : s));
        return { ...cat, sections };
      })
    );
  }, []);

  const deleteSection = useCallback((catId, sIdx) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        return { ...cat, sections: cat.sections.filter((_, i) => i !== sIdx) };
      })
    );
  }, []);

  const addItem = useCallback((catId, sIdx, item) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        const sections = cat.sections.map((s, i) =>
          i === sIdx ? { ...s, items: [...s.items, { ...item }] } : s
        );
        return { ...cat, sections };
      })
    );
  }, []);

  const updateItem = useCallback((catId, sIdx, iIdx, updates) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        const sections = cat.sections.map((s, si) => {
          if (si !== sIdx) return s;
          const items = s.items.map((item, ii) => (ii === iIdx ? { ...item, ...updates } : item));
          return { ...s, items };
        });
        return { ...cat, sections };
      })
    );
  }, []);

  const deleteItem = useCallback((catId, sIdx, iIdx) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        const sections = cat.sections.map((s, si) => {
          if (si !== sIdx) return s;
          return { ...s, items: s.items.filter((_, ii) => ii !== iIdx) };
        });
        return { ...cat, sections };
      })
    );
  }, []);

  const addStep = useCallback((catId, sIdx, iIdx, stepText) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        const sections = cat.sections.map((s, si) => {
          if (si !== sIdx) return s;
          const items = s.items.map((item, ii) => {
            if (ii !== iIdx) return item;
            return { ...item, steps: [...(item.steps || []), stepText] };
          });
          return { ...s, items };
        });
        return { ...cat, sections };
      })
    );
  }, []);

  const updateStep = useCallback((catId, sIdx, iIdx, stIdx, newText) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        const sections = cat.sections.map((s, si) => {
          if (si !== sIdx) return s;
          const items = s.items.map((item, ii) => {
            if (ii !== iIdx) return item;
            const steps = (item.steps || []).map((st, sti) => (sti === stIdx ? newText : st));
            return { ...item, steps };
          });
          return { ...s, items };
        });
        return { ...cat, sections };
      })
    );
  }, []);

  const deleteStep = useCallback((catId, sIdx, iIdx, stIdx) => {
    setSopCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        const sections = cat.sections.map((s, si) => {
          if (si !== sIdx) return s;
          const items = s.items.map((item, ii) => {
            if (ii !== iIdx) return item;
            return { ...item, steps: (item.steps || []).filter((_, sti) => sti !== stIdx) };
          });
          return { ...s, items };
        });
        return { ...cat, sections };
      })
    );
  }, []);

  // ========================
  //  Reminders CRUD
  // ========================
  const addReminder = useCallback((reminder) => {
    setReminders(prev => [{ ...reminder, id: genId() }, ...prev]);
  }, []);

  const updateReminder = useCallback((id, updates) => {
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteReminder = useCallback((id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleReminderComplete = useCallback((id) => {
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r)));
  }, []);

  // ========================
  //  Habits CRUD
  // ========================
  const addHabit = useCallback((habit) => {
    setHabits(prev => [...prev, { ...habit, id: genId(), current: 0, progress: 0 }]);
  }, []);

  const updateHabit = useCallback((id, updates) => {
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id !== id) return h;
        const merged = { ...h, ...updates };
        merged.progress = merged.target > 0 ? Math.round((merged.current / merged.target) * 100) : 0;
        return merged;
      });
      return updated;
    });
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  // ========================
  //  QuickStats CRUD
  // ========================
  const addQuickStat = useCallback((stat) => {
    setQuickStats(prev => [...prev, { ...stat, id: genId() }]);
  }, []);

  const updateQuickStat = useCallback((id, updates) => {
    setQuickStats(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteQuickStat = useCallback((id) => {
    setQuickStats(prev => prev.filter(s => s.id !== id));
  }, []);

  // ========================
  //  Budget CRUD
  // ========================
  const updateBudgetIncome = useCallback((income) => {
    setBudget(prev => ({ ...prev, monthlyIncome: Number(income) || 0 }));
  }, []);

  const addExpense = useCallback((expense) => {
    setBudget(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: genId() }],
    }));
  }, []);

  const updateExpense = useCallback((id, updates) => {
    setBudget(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => (e.id === id ? { ...e, ...updates, amount: Number(updates.amount) || 0 } : e)),
    }));
  }, []);

  const deleteExpense = useCallback((id) => {
    setBudget(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id),
    }));
  }, []);

  // ========================
  //  Health Logs CRUD
  // ========================
  const addHealthLog = useCallback((log) => {
    setHealthLogs(prev => [{ ...log, id: genId() }, ...prev]);
  }, []);

  const updateHealthLog = useCallback((id, updates) => {
    setHealthLogs(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const deleteHealthLog = useCallback((id) => {
    setHealthLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  // ========================
  //  Calendar Events CRUD
  // ========================
  const addCalendarEvent = useCallback((event) => {
    setCalendarEvents(prev => [{ ...event, id: genId() }, ...prev]);
  }, []);

  const updateCalendarEvent = useCallback((id, updates) => {
    setCalendarEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteCalendarEvent = useCallback((id) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // Sort reminders
  const sortedReminders = [...reminders].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const pa = priorityOrder[a.priority] || 2;
    const pb = priorityOrder[b.priority] || 2;
    if (pa !== pb) return pa - pb;
    return a.completed ? 1 : -1;
  });

  const value = {
    sopCategories,
    reminders: sortedReminders,
    habits,
    quickStats,
    budget,
    healthLogs,
    calendarEvents,

    // Reset
    resetAll,

    // SOP
    updateCategory,
    addSection,
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem,
    addStep,
    updateStep,
    deleteStep,

    // Reminders
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderComplete,

    // Habits
    addHabit,
    updateHabit,
    deleteHabit,

    // QuickStats
    addQuickStat,
    updateQuickStat,
    deleteQuickStat,

    // Budget
    updateBudgetIncome,
    addExpense,
    updateExpense,
    deleteExpense,

    // Health Logs
    addHealthLog,
    updateHealthLog,
    deleteHealthLog,

    // Calendar Events
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,

    // utility
    genId,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
