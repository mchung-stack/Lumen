import React, { useState, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import EditModal, { ConfirmDelete } from './EditModal';

const Dashboard = ({ onNavigate }) => {
  const {
    reminders, habits, sopCategories, healthLogs, budget, calendarEvents,
    addReminder, updateReminder, deleteReminder, toggleReminderComplete,
    addHabit, updateHabit, deleteHabit,
  } = useAppData();

  // Edit mode
  const [editMode, setEditMode] = useState(false);

  // Modal state
  const [modal, setModal] = useState({ open: false, title: '', fields: [], initialData: {}, onSave: () => {}, isNew: false });
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  const openModal = useCallback((title, fields, initialData, onSave, isNew = false) => {
    setModal({ open: true, title, fields, initialData, onSave, isNew });
  }, []);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, open: false }));
  }, []);

  const openConfirm = useCallback((title, message, onConfirm) => {
    setConfirm({ open: true, title, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, open: false }));
  }, []);

  // --- Reminder handlers ---
  const handleAddReminder = () => {
    openModal(
      '新增提醒',
      [
        { key: 'title', label: '標題', placeholder: '例：繳交水費' },
        { key: 'icon', label: '圖示 Emoji', placeholder: '例：💧' },
        { key: 'category', label: '分類', placeholder: '例：家居' },
        { key: 'dueDate', label: '到期日', placeholder: '例：每月 10 日' },
        { key: 'priority', label: '優先級', type: 'select', options: [
          { value: 'high', label: '高優先' },
          { value: 'medium', label: '中優先' },
          { value: 'low', label: '低優先' },
        ]},
      ],
      {},
      (data) => addReminder({ ...data, type: 'custom', completed: false }),
      true
    );
  };

  const handleEditReminder = (r) => {
    openModal(
      '編輯提醒',
      [
        { key: 'title', label: '標題' },
        { key: 'icon', label: '圖示 Emoji' },
        { key: 'category', label: '分類' },
        { key: 'dueDate', label: '到期日' },
        { key: 'priority', label: '優先級', type: 'select', options: [
          { value: 'high', label: '高優先' },
          { value: 'medium', label: '中優先' },
          { value: 'low', label: '低優先' },
        ]},
      ],
      r,
      (data) => updateReminder(r.id, data)
    );
  };

  const handleDeleteReminder = (r) => {
    openConfirm('刪除提醒', `確定要刪除「${r.title}」嗎？此操作無法復原。`, () => deleteReminder(r.id));
  };

  // --- Habit handlers ---
  const handleAddHabit = () => {
    openModal(
      '新增習慣',
      [
        { key: 'name', label: '習慣名稱', placeholder: '例：喝水 2000ml' },
        { key: 'icon', label: '圖示 Emoji', placeholder: '例：💧' },
        { key: 'target', label: '每日目標 (數字)', type: 'number', placeholder: '例：2000' },
        { key: 'unit', label: '單位', placeholder: '例：ml' },
        { key: 'step', label: '每次增減量', type: 'number', placeholder: '例：100' },
        { key: 'current', label: '今日進度', type: 'number', placeholder: '例：1400' },
      ],
      {},
      (data) => addHabit({ ...data, target: Number(data.target) || 0, current: Number(data.current) || 0, step: Number(data.step) || 1 }),
      true
    );
  };

  const handleEditHabit = (h) => {
    openModal(
      '編輯習慣',
      [
        { key: 'name', label: '習慣名稱' },
        { key: 'icon', label: '圖示 Emoji' },
        { key: 'target', label: '每日目標 (數字)', type: 'number' },
        { key: 'unit', label: '單位' },
        { key: 'step', label: '每次增減量', type: 'number' },
        { key: 'current', label: '今日進度', type: 'number' },
      ],
      h,
      (data) => updateHabit(h.id, { ...data, target: Number(data.target) || 0, current: Number(data.current) || 0, step: Number(data.step) || 1 })
    );
  };

  const handleDeleteHabit = (h) => {
    openConfirm('刪除習慣', `確定要刪除「${h.name}」嗎？此操作無法復原。`, () => deleteHabit(h.id));
  };

  const handleHabitProgress = (h, delta) => {
    const newCurrent = Math.max(0, Math.min(h.target, h.current + delta));
    updateHabit(h.id, { current: newCurrent });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <div className="page-header-top">
          <div
            className="page-header-icon"
            style={{ background: 'linear-gradient(135deg, #1E3A5F, #2563EB)' }}
          >
            📋
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">儀表板</h1>
            <p className="page-subtitle">今日概覽 — 將常識轉化為可執行的清單</p>
          </div>
          <button
            className={`btn ${editMode ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setEditMode(!editMode)}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            {editMode ? '✓ 完成編輯' : '✏️ 客製化'}
          </button>
        </div>
      </div>

      {/* Reminders & Habits */}
      <div className="two-col">
        {/* Reminders */}
        <div>
          <div className="section-header-row">
            <div className="section-title">
              <span>⏰</span> 主動提醒
            </div>
            {editMode && (
              <button className="btn btn-sm btn-primary" onClick={handleAddReminder}>＋ 新增</button>
            )}
          </div>
          <div className="reminders-grid">
            {reminders.slice(0, editMode ? reminders.length : 6).map((reminder, i) => (
              <div
                key={reminder.id}
                className={`reminder-card ${reminder.completed ? 'completed' : ''} ${editMode ? 'editable-card' : ''} animate-fade-in-up`}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                onClick={() => !editMode && toggleReminderComplete(reminder.id)}
              >
                <div className="reminder-icon">{reminder.icon}</div>
                <div className="reminder-info">
                  <div className="reminder-title">{reminder.title}</div>
                  <div className="reminder-meta">
                    <span>{reminder.dueDate}</span>
                    <span className={`reminder-priority priority-${reminder.priority}`}>
                      {reminder.priority === 'high' ? '高優先' : reminder.priority === 'medium' ? '中優先' : '低優先'}
                    </span>
                  </div>
                </div>
                <div className="reminder-check">
                  {reminder.completed ? '✓' : ''}
                </div>
                {editMode && (
                  <div className="edit-actions edit-actions-inline">
                    <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEditReminder(reminder); }} title="編輯">✏️</button>
                    <button className="edit-btn edit-btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteReminder(reminder); }} title="刪除">🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Habits */}
        <div>
          <div className="section-header-row">
            <div className="section-title">
              <span>🔥</span> 習慣追蹤
            </div>
            {editMode && (
              <button className="btn btn-sm btn-primary" onClick={handleAddHabit}>＋ 新增</button>
            )}
          </div>
          <div className="habits-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {habits.map((habit, i) => (
              <div
                key={habit.id}
                className={`habit-card animate-fade-in-up ${editMode ? 'editable-card' : ''}`}
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}
              >
                <div className="habit-icon">{habit.icon}</div>
                <div className="habit-name">{habit.name}</div>
                {!editMode && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                    <button className="btn-habit-adjust" onClick={() => handleHabitProgress(habit, -(habit.step || 1))}>−</button>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'center' }}>{habit.current}</span>
                    <button className="btn-habit-adjust" onClick={() => handleHabitProgress(habit, habit.step || 1)}>＋</button>
                  </div>
                )}
                <div className="habit-progress-bar">
                  <div
                    className={`habit-progress-fill ${habit.progress >= 100 ? 'done' : ''}`}
                    style={{ width: `${Math.min(habit.progress, 100)}%` }}
                  />
                </div>
                <div className="habit-progress-text">
                  {habit.current}{habit.unit} / {habit.target}{habit.unit}
                </div>
                {editMode && (
                  <div className="edit-actions" style={{ marginTop: '8px' }}>
                    <button className="edit-btn" onClick={() => handleEditHabit(habit)} title="編輯">✏️</button>
                    <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteHabit(habit)} title="刪除">🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Log Reminders */}
      {(() => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const trackTypes = ['體重', '血壓', '腰圍'];
        const alerts = trackTypes.map(type => {
          const logsOfType = healthLogs.filter(l => l.type === type).sort((a, b) => b.date.localeCompare(a.date));
          const lastLog = logsOfType[0];
          if (!lastLog) return { type, daysSince: 999, lastValue: null, needsLog: true };
          const daysSince = Math.floor((today - new Date(lastLog.date)) / 86400000);
          return { type, daysSince, lastValue: lastLog.value, lastUnit: lastLog.unit, needsLog: daysSince >= 3 };
        }).filter(a => a.needsLog);
        if (alerts.length === 0) return null;
        return (
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div className="section-title">
              <span>📈</span> 健康記錄提醒
            </div>
            <div className="health-alerts-row">
              {alerts.map(a => (
                <div key={a.type} className="health-alert-card animate-fade-in-up" onClick={() => onNavigate('health')}>
                  <div className="health-alert-icon">{a.type === '體重' ? '⚖️' : a.type === '血壓' ? '🩺' : '📏'}</div>
                  <div className="health-alert-info">
                    <div className="health-alert-type">{a.type}</div>
                    <div className="health-alert-detail">
                      {a.lastValue
                        ? `上次記錄：${a.lastValue} ${a.lastUnit}（${a.daysSince} 天前）`
                        : '尚未記錄'}
                    </div>
                  </div>
                  <div className="health-alert-action">記錄 →</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Upcoming Calendar Events */}
      {(() => {
        const now = new Date();
        const upcoming = calendarEvents.map(ev => {
          const [m, d] = ev.date.split('-').map(Number);
          let eventDate = new Date(now.getFullYear(), m - 1, d);
          if (eventDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            eventDate = new Date(now.getFullYear() + 1, m - 1, d);
          }
          const diffDays = Math.ceil((eventDate - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
          return { ...ev, daysUntil: diffDays, eventDate };
        }).filter(e => e.daysUntil <= 14).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 4);

        if (upcoming.length === 0) return null;

        const typeConfig = {
          birthday: { icon: '🎂', label: '生日' },
          anniversary: { icon: '💕', label: '紀念日' },
          other: { icon: '📌', label: '事件' },
        };

        return (
          <div style={{ marginBottom: '24px' }}>
            <div className="section-title">
              <span>📅</span> 近期親友事件
            </div>
            <div className="health-alerts-row">
              {upcoming.map(ev => {
                const cfg = typeConfig[ev.type] || typeConfig.other;
                return (
                  <div key={ev.id} className="health-alert-card animate-fade-in-up" onClick={() => onNavigate('calendar')} style={{ borderColor: ev.daysUntil <= 3 ? 'var(--danger)' : 'var(--border-subtle)' }}>
                    <div className="health-alert-icon" style={{ fontSize: '28px' }}>{cfg.icon}</div>
                    <div className="health-alert-info">
                      <div className="health-alert-type">{ev.name} · {cfg.label}</div>
                      <div className="health-alert-detail">
                        {ev.eventDate.getMonth() + 1}/{ev.eventDate.getDate()}
                        {ev.daysUntil === 0 ? ' 🎉 今天！' : ` · 還有 ${ev.daysUntil} 天`}
                      </div>
                    </div>
                    <div className="health-alert-action" style={{
                      color: ev.daysUntil <= 3 ? 'var(--danger)' : 'var(--blue-300)',
                      fontWeight: 700, fontSize: '13px',
                    }}>
                      {ev.daysUntil === 0 ? '🎉' : `D-${ev.daysUntil}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Budget Summary */}
      {(() => {
        const totalExpenses = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = budget.monthlyIncome - totalExpenses;
        return (
          <div style={{ marginBottom: '24px' }}>
            <div className="section-title">
              <span>💰</span> 本月預算概覽
            </div>
            <div className="budget-summary-mini animate-fade-in-up" onClick={() => onNavigate('budget')} style={{ cursor: 'pointer' }}>
              <div className="budget-mini-item">
                <div className="budget-mini-label">收入</div>
                <div className="budget-mini-value income">HK$ {budget.monthlyIncome.toLocaleString()}</div>
              </div>
              <div className="budget-mini-divider" />
              <div className="budget-mini-item">
                <div className="budget-mini-label">支出</div>
                <div className="budget-mini-value expense">HK$ {totalExpenses.toLocaleString()}</div>
              </div>
              <div className="budget-mini-divider" />
              <div className="budget-mini-item">
                <div className="budget-mini-label">結餘</div>
                <div className={`budget-mini-value ${balance >= 0 ? 'balance' : 'negative'}`}>
                  HK$ {balance.toLocaleString()}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '12px' }}>
                查看詳情 →
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quick Access Categories */}
      <div className="section-title" style={{ marginTop: '8px' }}>
        <span>📂</span> 快速進入
      </div>
      <div className="categories-grid">
        {sopCategories.map((cat, i) => (
          <div
            key={cat.id}
            className="category-link-card animate-fade-in-up"
            style={{ animationDelay: `${0.2 + i * 0.05}s` }}
            onClick={() => onNavigate(cat.id)}
          >
            <div className="category-link-icon">{cat.icon}</div>
            <div className="category-link-name">{cat.name}</div>
            <div className="category-link-desc">
              {cat.sections.length} 個分類 · {cat.sections.reduce((acc, s) => acc + s.items.length, 0)} 個項目
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <EditModal {...modal} onClose={closeModal} />
      <ConfirmDelete {...confirm} onCancel={closeConfirm} onConfirm={() => { closeConfirm(); confirm.onConfirm(); }} />
    </div>
  );
};

export default Dashboard;
