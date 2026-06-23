// 今日提醒数据 - 模拟主动提醒引擎
const today = new Date();
const day = today.getDate();
const month = today.getMonth();

const generateReminders = () => {
  const base = [
    {
      id: 1,
      type: 'maintenance',
      title: '冷氣濾網清潔',
      category: '家居',
      dueDate: '每月 15 日',
      priority: 'high',
      icon: '❄️',
      completed: day > 15,
    },
    {
      id: 2,
      type: 'bill',
      title: '電費帳單繳費',
      category: '財務',
      dueDate: `每月 ${day + 3} 日`,
      priority: 'high',
      icon: '⚡',
      completed: false,
    },
    {
      id: 3,
      type: 'health',
      title: '體重記錄',
      category: '健康',
      dueDate: '每日',
      priority: 'medium',
      icon: '⚖️',
      completed: day % 2 === 0,
    },
    {
      id: 4,
      type: 'maintenance',
      title: '洗衣機槽清潔',
      category: '家居',
      dueDate: '每季 1 日',
      priority: 'medium',
      icon: '🧺',
      completed: month % 3 !== 0,
    },
    {
      id: 5,
      type: 'social',
      title: '媽媽生日倒數 5 天',
      category: '人際',
      dueDate: `${month + 1}/${day + 5}`,
      priority: 'high',
      icon: '🎂',
      completed: false,
    },
    {
      id: 6,
      type: 'inventory',
      title: '衛生紙庫存偏低',
      category: '家居',
      dueDate: '需補充',
      priority: 'medium',
      icon: '🧻',
      completed: false,
    },
    {
      id: 7,
      type: 'bill',
      title: '管理費繳交',
      category: '財務',
      dueDate: '每月 10 日',
      priority: 'high',
      icon: '🏢',
      completed: day > 10,
    },
    {
      id: 8,
      type: 'health',
      title: '眼科回診',
      category: '健康',
      dueDate: `${month + 1}/28 14:30`,
      priority: 'high',
      icon: '👁️',
      completed: false,
    },
  ];

  return base.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const pa = priorityOrder[a.priority];
    const pb = priorityOrder[b.priority];
    if (pa !== pb) return pa - pb;
    return a.completed ? 1 : -1;
  });
};

export const reminders = generateReminders();

export const habitTracker = [
  { id: 1, name: '喝水 2000ml', icon: '💧', progress: 70, target: 2000, unit: 'ml', current: 1400 },
  { id: 2, name: '閱讀 30 分鐘', icon: '📖', progress: 100, target: 30, unit: 'min', current: 30 },
  { id: 3, name: '早睡 (23:00前)', icon: '🌙', progress: 0, target: 1, unit: '', current: 0 },
  { id: 4, name: '運動 20 分鐘', icon: '🏃', progress: 50, target: 20, unit: 'min', current: 10 },
  { id: 5, name: '冥想 10 分鐘', icon: '🧘', progress: 100, target: 10, unit: 'min', current: 10 },
];

export const quickStats = [
  { label: '待辦事項', value: '5', change: '+2', icon: '📋' },
  { label: '本月儲蓄', value: 'HK$8,500', change: '+12%', icon: '💰' },
  { label: '習慣連續', value: '7 天', change: '🔥', icon: '🔥' },
  { label: '即將到期', value: '3 項', change: '⚠️', icon: '⏰' },
];
