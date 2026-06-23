import React from 'react';
import { useAppData } from '../context/AppDataContext';

const Sidebar = ({ activeCategory, onCategoryChange, isOpen, onClose }) => {
  const { sopCategories } = useAppData();

  const handleNavClick = (categoryId) => {
    onCategoryChange(categoryId);
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <a href="#" className="sidebar-logo" onClick={() => handleNavClick('home')}>
            <div className="sidebar-logo-icon">📋</div>
            <div>
              <div className="sidebar-logo-text">大人生活指南</div>
              <div className="sidebar-logo-sub">SOP 資料庫 × 提醒引擎</div>
            </div>
          </a>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">總覽</div>
          <button
            className={`nav-item ${activeCategory === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <span className="nav-item-icon">🏠</span>
            儀表板
            <span className="nav-item-badge">5</span>
          </button>

          <div className="sidebar-section-title">生活模組</div>
          {sopCategories.map((cat) => (
            <button
              key={cat.id}
              className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleNavClick(cat.id)}
            >
              <span className="nav-item-icon">{cat.icon}</span>
              {cat.name}
            </button>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: '8px' }}>
            快速工具
          </div>
          <button
            className={`nav-item ${activeCategory === 'budget' ? 'active' : ''}`}
            onClick={() => handleNavClick('budget')}
          >
            <span className="nav-item-icon">💰</span>
            預算管理
          </button>
          <button
            className={`nav-item ${activeCategory === 'health' ? 'active' : ''}`}
            onClick={() => handleNavClick('health')}
          >
            <span className="nav-item-icon">📈</span>
            健康追蹤
          </button>
          <button
            className={`nav-item ${activeCategory === 'calendar' ? 'active' : ''}`}
            onClick={() => handleNavClick('calendar')}
          >
            <span className="nav-item-icon">📅</span>
            親友日曆
          </button>
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>高級大人生活指南 v1.0</div>
            <div>將常識轉化為可執行的清單</div>
            <div>降低決策疲勞，提升生活掌控感</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
