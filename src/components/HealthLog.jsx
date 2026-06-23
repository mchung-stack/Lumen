import React, { useState, useCallback, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import EditModal, { ConfirmDelete } from './EditModal';

const TRACK_TYPES = [
  { value: '體重', label: '體重', unit: 'kg', icon: '⚖️' },
  { value: '血壓', label: '血壓', unit: 'mmHg', icon: '🩺' },
  { value: '腰圍', label: '腰圍', unit: 'cm', icon: '📏' },
  { value: '體脂率', label: '體脂率', unit: '%', icon: '💪' },
  { value: '血糖', label: '血糖', unit: 'mmol/L', icon: '🩸' },
  { value: '心率', label: '心率', unit: 'bpm', icon: '❤️' },
];

const HealthLog = () => {
  const {
    healthLogs, addHealthLog, updateHealthLog, deleteHealthLog,
  } = useAppData();

  const [activeType, setActiveType] = useState('體重');
  const [modal, setModal] = useState({ open: false, title: '', fields: [], initialData: {}, onSave: () => {}, isNew: false });
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  const openModal = useCallback((title, fields, initialData, onSave, isNew = false) => {
    setModal({ open: true, title, fields, initialData, onSave, isNew });
  }, []);
  const closeModal = useCallback(() => setModal(prev => ({ ...prev, open: false })), []);
  const openConfirm = useCallback((title, message, onConfirm) => {
    setConfirm({ open: true, title, message, onConfirm });
  }, []);
  const closeConfirm = useCallback(() => setConfirm(prev => ({ ...prev, open: false })), []);

  const filteredLogs = useMemo(() =>
    healthLogs.filter(l => l.type === activeType).sort((a, b) => b.date.localeCompare(a.date)),
    [healthLogs, activeType]
  );

  const activeTypeInfo = TRACK_TYPES.find(t => t.value === activeType);

  const handleAddLog = () => {
    const today = new Date();
    const fmt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    openModal(
      `新增${activeType}記錄`,
      [
        { key: 'date', label: '日期', type: 'date', placeholder: fmt },
        { key: 'value', label: `數值 (${activeTypeInfo?.unit || ''})`, placeholder: '例：68' },
        { key: 'note', label: '備註', placeholder: '例：早晨空腹' },
      ],
      { date: fmt, value: '', note: '' },
      (data) => addHealthLog({ type: activeType, value: data.value, unit: activeTypeInfo?.unit || '', date: data.date, note: data.note || '' }),
      true
    );
  };

  const handleEditLog = (log) => {
    openModal(
      '編輯記錄',
      [
        { key: 'date', label: '日期', type: 'date' },
        { key: 'value', label: `數值 (${log.unit})` },
        { key: 'note', label: '備註' },
      ],
      log,
      (data) => updateHealthLog(log.id, data)
    );
  };

  const handleDeleteLog = (log) => {
    openConfirm('刪除記錄', `確定要刪除 ${log.date} 的${log.type}記錄嗎？`, () => deleteHealthLog(log.id));
  };

  // Simple chart data
  const chartData = [...filteredLogs].reverse().slice(-12);

  return (
    <div className="category-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #1E3A5F, #60A5FA)' }}>
            📈
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">健康數據追蹤</h1>
            <p className="page-subtitle">記錄體重、血壓等指標，掌握健康趨勢</p>
          </div>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="health-type-tabs animate-fade-in-up">
        {TRACK_TYPES.map(t => (
          <button
            key={t.value}
            className={`health-type-tab ${activeType === t.value ? 'active' : ''}`}
            onClick={() => setActiveType(t.value)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Mini Chart */}
      {chartData.length > 1 && (
        <div className="health-chart animate-fade-in-up stagger-1">
          <div className="section-title">
            <span>📊</span> 近期趨勢
          </div>
          <div className="health-chart-visual">
            {chartData.map((d, i) => {
              const vals = chartData.map(x => parseFloat(x.value));
              const maxVal = Math.max(...vals);
              const minVal = Math.min(...vals);
              const range = maxVal - minVal || 1;
              const height = ((parseFloat(d.value) - minVal) / range) * 80 + 10;
              return (
                <div key={d.id} className="health-bar-col">
                  <div
                    className="health-bar"
                    style={{ height: `${height}%` }}
                    title={`${d.date}: ${d.value} ${d.unit}`}
                  />
                  <div className="health-bar-date">{d.date.slice(5)}</div>
                  <div className="health-bar-value">{d.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log List */}
      <div className="health-log-section animate-fade-in-up stagger-2">
        <div className="section-header-row">
          <div className="section-title">
            <span>{activeTypeInfo?.icon}</span> {activeType}記錄
            <span className="health-log-count">{filteredLogs.length} 筆</span>
          </div>
          <button className="btn btn-sm btn-primary" onClick={handleAddLog}>＋ 新增記錄</button>
        </div>

        <div className="health-log-list">
          {filteredLogs.map((log, i) => (
            <div key={log.id} className="health-log-row editable-row">
              <div className="health-log-date">{log.date}</div>
              <div className="health-log-value">
                <strong>{log.value}</strong>
                <span className="health-log-unit"> {log.unit}</span>
              </div>
              {log.note && <div className="health-log-note">{log.note}</div>}
              <div className="edit-actions edit-actions-inline">
                <button className="edit-btn" onClick={() => handleEditLog(log)} title="編輯">✏️</button>
                <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteLog(log)} title="刪除">🗑️</button>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">{activeTypeInfo?.icon}</div>
              <div className="empty-state-title">尚無{activeType}記錄</div>
              <div className="empty-state-desc">點擊上方按鈕記錄第一筆數據</div>
            </div>
          )}
        </div>

        {/* Latest summary */}
        {filteredLogs.length > 0 && (
          <div className="health-latest-summary">
            <div className="health-latest-label">最近記錄</div>
            <div className="health-latest-value">
              {filteredLogs[0].date}：{filteredLogs[0].value} {filteredLogs[0].unit}
            </div>
            {filteredLogs.length > 1 && (
              <div className="health-latest-change">
                上次（{filteredLogs[1].date}）：{filteredLogs[1].value} {filteredLogs[1].unit}
              </div>
            )}
          </div>
        )}
      </div>

      <EditModal {...modal} onClose={closeModal} />
      <ConfirmDelete {...confirm} onCancel={closeConfirm} onConfirm={() => { closeConfirm(); confirm.onConfirm(); }} />
    </div>
  );
};

export default HealthLog;
