import React, { useState, useEffect } from 'react';

/**
 * Generic edit modal
 * @param {boolean} open
 * @param {()=>void} onClose
 * @param {string} title
 * @param {object} initialData - form initial values
 * @param {Array<{key:string, label:string, type?:string, placeholder?:string, options?:Array}>} fields
 * @param {(data:object)=>void} onSave
 * @param {boolean} isNew - whether creating new vs editing existing
 */
export default function EditModal({ open, onClose, title, initialData = {}, fields = [], onSave, isNew = false }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (open) {
      const init = {};
      fields.forEach(f => {
        init[f.key] = initialData[f.key] !== undefined ? initialData[f.key] : '';
      });
      setForm(init);
    }
  }, [open, initialData, fields]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isNew ? '➕ ' : '✏️ '}{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {fields.map(f => {
              if (f.type === 'select') {
                return (
                  <div className="form-group" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <select
                      className="form-input"
                      value={form[f.key] || ''}
                      onChange={e => handleChange(f.key, e.target.value)}
                    >
                      <option value="">-- 選擇 --</option>
                      {(f.options || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              if (f.type === 'textarea') {
                return (
                  <div className="form-group" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <textarea
                      className="form-input form-textarea"
                      value={form[f.key] || ''}
                      onChange={e => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ''}
                      rows={f.rows || 3}
                    />
                  </div>
                );
              }
              return (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-input"
                    type={f.type || 'text'}
                    value={form[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder || ''}
                  />
                </div>
              );
            })}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-cancel" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">{isNew ? '新增' : '儲存'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Inline quick-edit for a single step text */
export function InlineStepEdit({ text, onSave, onCancel }) {
  const [value, setValue] = useState(text);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(value);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="inline-edit-row">
      <input
        className="form-input inline-edit-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <button className="btn btn-sm btn-primary" onClick={() => onSave(value)}>✓</button>
      <button className="btn btn-sm btn-cancel" onClick={onCancel}>✕</button>
    </div>
  );
}

/** Delete confirmation dialog */
export function ConfirmDelete({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: 'var(--danger)' }}>⚠️ {title}</h3>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onCancel}>取消</button>
          <button className="btn btn-danger" onClick={onConfirm}>確認刪除</button>
        </div>
      </div>
    </div>
  );
}
