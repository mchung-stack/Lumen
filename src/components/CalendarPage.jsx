import React, { useState, useCallback, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import EditModal, { ConfirmDelete } from './EditModal';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

const EVENT_TYPE_CONFIG = {
  birthday: { label: '🎂 生日', icon: '🎂', color: '#F87171' },
  anniversary: { label: '💕 紀念日', icon: '💕', color: '#F472B6' },
  other: { label: '📌 其他', icon: '📌', color: '#60A5FA' },
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function formatDateKey(month, day) {
  return `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const CalendarPage = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useAppData();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null); // { month, day } or null

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

  // Navigate months
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(v => v - 1); setViewMonth(11); }
    else setViewMonth(v => v - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(v => v + 1); setViewMonth(0); }
    else setViewMonth(v => v + 1);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(null);
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const totalCells = firstDay + daysInMonth;
  const rows = Math.ceil(totalCells / 7);
  const cells = [];

  for (let i = 0; i < rows * 7; i++) {
    const day = i - firstDay + 1;
    const isInMonth = day >= 1 && day <= daysInMonth;
    cells.push({ day, isInMonth });
  }

  // Events map: MM-DD -> events[]
  const eventsByDate = useMemo(() => {
    const map = {};
    calendarEvents.forEach(ev => {
      const key = ev.date; // MM-DD
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [calendarEvents]);

  // Events for selected date
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate.month, selectedDate.day) : null;
  const selectedEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : [];

  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const results = [];
    calendarEvents.forEach(ev => {
      const [m, d] = ev.date.split('-').map(Number);
      // Create a date this year
      let eventDate = new Date(now.getFullYear(), m - 1, d);
      // If already passed this year, look at next year
      if (eventDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        eventDate = new Date(now.getFullYear() + 1, m - 1, d);
      }
      const diffDays = Math.ceil((eventDate - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
      if (diffDays >= 0 && diffDays <= 30) {
        results.push({ ...ev, daysUntil: diffDays, eventDate });
      }
    });
    results.sort((a, b) => a.daysUntil - b.daysUntil);
    return results;
  }, [calendarEvents]);

  // Add event
  const handleAddEvent = (presetDate) => {
    openModal(
      '新增事件',
      [
        { key: 'name', label: '名稱', placeholder: '例：媽媽生日' },
        { key: 'date', label: '日期 (MM-DD)', placeholder: '例：05-15', value: presetDate },
        {
          key: 'type', label: '類型', type: 'select', options: [
            { value: 'birthday', label: '🎂 生日' },
            { value: 'anniversary', label: '💕 紀念日' },
            { value: 'other', label: '📌 其他' },
          ],
        },
        { key: 'year', label: '年份 (選填)', placeholder: '例：2020' },
        { key: 'note', label: '備註', type: 'textarea', placeholder: '例：買蛋糕、訂餐廳', rows: 2 },
      ],
      { date: presetDate || '', type: 'birthday', name: '', year: '', note: '' },
      (data) => addCalendarEvent({
        name: data.name,
        date: data.date,
        type: data.type || 'birthday',
        year: data.year || null,
        note: data.note || '',
      }),
      true
    );
  };

  const handleEditEvent = (ev, e) => {
    e.stopPropagation();
    openModal(
      '編輯事件',
      [
        { key: 'name', label: '名稱' },
        { key: 'date', label: '日期 (MM-DD)' },
        {
          key: 'type', label: '類型', type: 'select', options: [
            { value: 'birthday', label: '🎂 生日' },
            { value: 'anniversary', label: '💕 紀念日' },
            { value: 'other', label: '📌 其他' },
          ],
        },
        { key: 'year', label: '年份 (選填)' },
        { key: 'note', label: '備註', type: 'textarea', rows: 2 },
      ],
      ev,
      (data) => updateCalendarEvent(ev.id, {
        name: data.name,
        date: data.date,
        type: data.type,
        year: data.year || null,
        note: data.note || '',
      })
    );
  };

  const handleDeleteEvent = (ev, e) => {
    e.stopPropagation();
    openConfirm('刪除事件', `確定要刪除「${ev.name}」嗎？此操作無法復原。`, () => deleteCalendarEvent(ev.id));
  };

  // Check if a day is today
  const isToday = (day, inMonth) => {
    if (!inMonth) return false;
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  // Check if a day has events
  const getDayEvents = (day) => {
    const key = formatDateKey(viewMonth, day);
    return eventsByDate[key] || [];
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <div className="page-header-top">
          <div
            className="page-header-icon"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
          >
            📅
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">親友日曆</h1>
            <p className="page-subtitle">記錄親友生日、紀念日，不再錯過重要日子</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleAddEvent('')}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            ＋ 新增事件
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Calendar */}
        <div className="calendar-main animate-fade-in-up">
          {/* Month Navigation */}
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={prevMonth}>◀</button>
            <div className="calendar-nav-title">
              <span className="calendar-nav-month">{MONTHS[viewMonth]}</span>
              <span className="calendar-nav-year" onClick={goToToday}>{viewYear}</span>
            </div>
            <button className="calendar-nav-btn" onClick={nextMonth}>▶</button>
            <button className="btn btn-sm btn-outline" onClick={goToToday} style={{ marginLeft: '8px' }}>今天</button>
          </div>

          {/* Weekday Headers */}
          <div className="calendar-weekdays">
            {WEEKDAYS.map(w => (
              <div key={w} className="calendar-weekday">{w}</div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="calendar-grid">
            {cells.map((cell, idx) => {
              const dayEvents = cell.isInMonth ? getDayEvents(cell.day) : [];
              const selected = cell.isInMonth && selectedDate &&
                selectedDate.month === viewMonth && selectedDate.day === cell.day;
              const todayClass = isToday(cell.day, cell.isInMonth);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={idx}
                  className={`calendar-day ${!cell.isInMonth ? 'outside' : ''} ${todayClass ? 'today' : ''} ${selected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
                  onClick={() => {
                    if (cell.isInMonth) {
                      setSelectedDate({ month: viewMonth, day: cell.day });
                    }
                  }}
                >
                  <span className="calendar-day-num">{cell.isInMonth ? cell.day : ''}</span>
                  {cell.isInMonth && hasEvents && (
                    <div className="calendar-day-dots">
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <span
                          key={i}
                          className="calendar-day-dot"
                          style={{ background: (EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.other).color }}
                          title={ev.name}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="calendar-day-more">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="calendar-selected-events animate-fade-in">
              <div className="calendar-selected-header">
                <span>{viewYear} 年 {viewMonth + 1} 月 {selectedDate.day} 日</span>
                <button className="btn btn-sm btn-primary" onClick={() => handleAddEvent(selectedDateKey)}>＋ 新增</button>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="calendar-no-events">當天沒有事件</div>
              ) : (
                <div className="calendar-events-list">
                  {selectedEvents.map(ev => (
                    <div key={ev.id} className="calendar-event-card">
                      <div
                        className="calendar-event-dot-lg"
                        style={{ background: (EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.other).color }}
                      />
                      <div className="calendar-event-info">
                        <div className="calendar-event-name">
                          {(EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.other).icon} {ev.name}
                        </div>
                        <div className="calendar-event-meta">
                          {(EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.other).label}
                          {ev.year ? ` · 始於 ${ev.year} 年` : ''}
                          {ev.note ? ` · ${ev.note}` : ''}
                        </div>
                      </div>
                      <div className="calendar-event-actions">
                        <button className="edit-btn" onClick={(e) => handleEditEvent(ev, e)} title="編輯">✏️</button>
                        <button className="edit-btn edit-btn-danger" onClick={(e) => handleDeleteEvent(ev, e)} title="刪除">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="calendar-upcoming animate-fade-in-up stagger-2">
          <div className="calendar-upcoming-title">
            <span>⏳</span> 近期事件
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="calendar-no-events" style={{ padding: '20px' }}>
              未來 30 天沒有事件
            </div>
          ) : (
            <div className="calendar-upcoming-list">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="calendar-upcoming-card">
                  <div
                    className="calendar-upcoming-dot"
                    style={{ background: (EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.other).color }}
                  />
                  <div className="calendar-upcoming-info">
                    <div className="calendar-upcoming-name">
                      {(EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.other).icon} {ev.name}
                    </div>
                    <div className="calendar-upcoming-date">
                      {ev.eventDate.getMonth() + 1}/{ev.eventDate.getDate()}
                      {ev.daysUntil === 0 ? (
                        <span className="calendar-upcoming-today">🎉 今天！</span>
                      ) : (
                        <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          還有 {ev.daysUntil} 天
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="calendar-upcoming-countdown">
                    {ev.daysUntil === 0 ? '🎉' : ev.daysUntil <= 3 ? `🔥${ev.daysUntil}` : `D-${ev.daysUntil}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="calendar-legend">
            <div className="calendar-legend-title">圖例</div>
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, cfg]) => (
              <div key={key} className="calendar-legend-item">
                <span className="calendar-legend-dot" style={{ background: cfg.color }} />
                <span>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditModal {...modal} onClose={closeModal} />
      <ConfirmDelete {...confirm} onCancel={closeConfirm} onConfirm={() => { closeConfirm(); confirm.onConfirm(); }} />
    </div>
  );
};

export default CalendarPage;
