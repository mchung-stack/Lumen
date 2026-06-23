import React, { useState, useCallback } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoryPage from './components/CategoryPage';
import BudgetManager from './components/BudgetManager';
import HealthLog from './components/HealthLog';
import CalendarPage from './components/CalendarPage';
import ResetButton from './components/ResetButton';
import './styles/global.css';

function App() {
  const [activeCategory, setActiveCategory] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    setSidebarOpen(false);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <AppDataProvider>
      {/* Background Effects */}
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-bottom" />

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div className="app-container">
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={handleNavigate}
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />

        <main className="main-content">
          {activeCategory === 'home' ? (
            <Dashboard onNavigate={handleNavigate} />
          ) : activeCategory === 'budget' ? (
            <BudgetManager />
          ) : activeCategory === 'health' ? (
            <HealthLog />
          ) : activeCategory === 'calendar' ? (
            <CalendarPage />
          ) : (
            <CategoryPage categoryId={activeCategory} />
          )}
        </main>
      </div>

      <ResetButton />
    </AppDataProvider>
  );
}

export default App;
