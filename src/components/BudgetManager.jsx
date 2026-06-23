import React, { useState, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import EditModal, { ConfirmDelete } from './EditModal';

const BudgetManager = () => {
  const {
    budget, updateBudgetIncome, addExpense, updateExpense, deleteExpense,
  } = useAppData();

  const totalExpenses = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = budget.monthlyIncome - totalExpenses;
  const savingRate = budget.monthlyIncome > 0 ? Math.round((balance / budget.monthlyIncome) * 100) : 0;

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

  const handleEditIncome = () => {
    openModal(
      '設定月收入',
      [{ key: 'monthlyIncome', label: '每月收入 (HK$)', type: 'number', placeholder: '例：25000' }],
      { monthlyIncome: budget.monthlyIncome },
      (data) => updateBudgetIncome(data.monthlyIncome)
    );
  };

  const handleAddExpense = () => {
    openModal(
      '新增支出項目',
      [
        { key: 'category', label: '類別', placeholder: '例：租金' },
        { key: 'amount', label: '每月金額 (HK$)', type: 'number', placeholder: '例：12000' },
      ],
      {},
      (data) => addExpense({ category: data.category, amount: Number(data.amount) || 0 }),
      true
    );
  };

  const handleEditExpense = (exp) => {
    openModal(
      '編輯支出',
      [
        { key: 'category', label: '類別' },
        { key: 'amount', label: '每月金額 (HK$)', type: 'number' },
      ],
      exp,
      (data) => updateExpense(exp.id, data)
    );
  };

  const handleDeleteExpense = (exp) => {
    openConfirm('刪除支出', `確定要刪除「${exp.category}」嗎？`, () => deleteExpense(exp.id));
  };

  const expenseColors = [
    'var(--blue-400)', 'var(--blue-500)', '#6366F1', '#8B5CF6',
    '#A855F7', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#22C55E',
  ];

  return (
    <div className="category-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #1E3A5F, #2563EB)' }}>
            💰
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">預算管理</h1>
            <p className="page-subtitle">掌握每月收入與支出，實現財務目標</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="budget-summary">
        <div className="budget-summary-card animate-fade-in-up">
          <div className="budget-summary-icon">💵</div>
          <div className="budget-summary-label">月收入</div>
          <div className="budget-summary-value income">HK$ {budget.monthlyIncome.toLocaleString()}</div>
          <button className="btn btn-sm btn-outline" style={{ marginTop: '8px' }} onClick={handleEditIncome}>
            ✏️ 修改
          </button>
        </div>
        <div className="budget-summary-card animate-fade-in-up stagger-1">
          <div className="budget-summary-icon">💸</div>
          <div className="budget-summary-label">總支出</div>
          <div className="budget-summary-value expense">HK$ {totalExpenses.toLocaleString()}</div>
        </div>
        <div className="budget-summary-card animate-fade-in-up stagger-2">
          <div className="budget-summary-icon">{balance >= 0 ? '🏦' : '⚠️'}</div>
          <div className="budget-summary-label">每月結餘</div>
          <div className={`budget-summary-value ${balance >= 0 ? 'balance' : 'negative'}`}>
            HK$ {balance.toLocaleString()}
          </div>
          <div className="budget-savings-rate">
            儲蓄率 {savingRate}%
          </div>
        </div>
      </div>

      {/* 50/30/20 comparison */}
      <div className="budget-rule-section animate-fade-in-up stagger-3">
        <div className="section-title">
          <span>📊</span> 50/30/20 法則對比
        </div>
        <div className="budget-rule-bars">
          <div className="budget-rule-item">
            <div className="budget-rule-label">必要支出 50%</div>
            <div className="budget-rule-bar-container">
              <div className="budget-rule-bar needs" style={{ width: `${Math.min((totalExpenses / (budget.monthlyIncome || 1)) * 100, 100)}%` }}>
                <span>HK$ {totalExpenses.toLocaleString()}</span>
              </div>
            </div>
            <div className="budget-rule-target">目標 ≤ HK$ {(budget.monthlyIncome * 0.5).toLocaleString()}</div>
          </div>
          <div className="budget-rule-item">
            <div className="budget-rule-label">儲蓄投資 20%</div>
            <div className="budget-rule-bar-container">
              <div className="budget-rule-bar savings" style={{ width: `${Math.min(Math.max((balance / (budget.monthlyIncome || 1)) * 100, 0), 100)}%` }}>
                <span>HK$ {Math.max(balance, 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="budget-rule-target">目標 ≥ HK$ {(budget.monthlyIncome * 0.2).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="expense-list-section animate-fade-in-up stagger-4">
        <div className="section-header-row">
          <div className="section-title">
            <span>📋</span> 支出明細
          </div>
          <button className="btn btn-sm btn-primary" onClick={handleAddExpense}>＋ 新增支出</button>
        </div>

        <div className="expense-list">
          {budget.expenses.map((exp, i) => (
            <div key={exp.id} className="expense-row editable-row">
              <div className="expense-color-dot" style={{ background: expenseColors[i % expenseColors.length] }} />
              <div className="expense-category">{exp.category}</div>
              <div className="expense-amount">HK$ {exp.amount.toLocaleString()}</div>
              <div className="expense-bar-container">
                <div
                  className="expense-bar"
                  style={{
                    width: `${Math.min((exp.amount / (budget.monthlyIncome || 1)) * 100, 100)}%`,
                    background: expenseColors[i % expenseColors.length],
                  }}
                />
              </div>
              <div className="expense-percent">
                {budget.monthlyIncome > 0 ? Math.round((exp.amount / budget.monthlyIncome) * 100) : 0}%
              </div>
              <div className="edit-actions edit-actions-inline">
                <button className="edit-btn" onClick={() => handleEditExpense(exp)} title="編輯">✏️</button>
                <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteExpense(exp)} title="刪除">🗑️</button>
              </div>
            </div>
          ))}
          {budget.expenses.length === 0 && (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">暫無支出項目</div>
              <div className="empty-state-desc">點擊上方按鈕新增支出類別</div>
            </div>
          )}
        </div>
      </div>

      <EditModal {...modal} onClose={closeModal} />
      <ConfirmDelete {...confirm} onCancel={closeConfirm} onConfirm={() => { closeConfirm(); confirm.onConfirm(); }} />
    </div>
  );
};

export default BudgetManager;
