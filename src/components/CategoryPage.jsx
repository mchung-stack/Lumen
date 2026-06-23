import React, { useState, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import EditModal, { InlineStepEdit, ConfirmDelete } from './EditModal';
import LaundryIcons from './LaundryIcons';

const CategoryPage = ({ categoryId }) => {
  const {
    sopCategories,
    updateCategory,
    addSection, updateSection, deleteSection,
    addItem, updateItem, deleteItem,
    addStep, updateStep, deleteStep,
  } = useAppData();

  const category = sopCategories.find(c => c.id === categoryId) || sopCategories[0];

  const [expandedSections, setExpandedSections] = useState(
    category.sections.reduce((acc, _, i) => ({ ...acc, [i]: true }), {})
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [editMode, setEditMode] = useState(false);

  // Inline step editing
  const [editingStep, setEditingStep] = useState(null); // { sIdx, iIdx, stIdx }

  // Modal state
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

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleItem = (sectionIdx, itemIdx) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${sectionIdx}-${itemIdx}`]: !prev[`${sectionIdx}-${itemIdx}`],
    }));
  };

  const hasSteps = (item) => item.steps && item.steps.length > 0;

  // --- Category handlers ---
  const handleEditCategory = () => {
    openModal(
      '編輯分類',
      [
        { key: 'name', label: '分類名稱' },
        { key: 'icon', label: '圖示 Emoji', placeholder: '例：🏠' },
      ],
      category,
      (data) => updateCategory(categoryId, data)
    );
  };

  // --- Section handlers ---
  const handleAddSection = () => {
    openModal(
      '新增子分類',
      [
        { key: 'title', label: '子分類名稱', placeholder: '例：定期保養提醒' },
        { key: 'icon', label: '圖示 Emoji', placeholder: '例：🔧' },
      ],
      {},
      (data) => addSection(categoryId, { title: data.title, icon: data.icon, items: [] }),
      true
    );
  };

  const handleEditSection = (sIdx, section) => {
    openModal(
      '編輯子分類',
      [
        { key: 'title', label: '子分類名稱' },
        { key: 'icon', label: '圖示 Emoji' },
      ],
      section,
      (data) => updateSection(categoryId, sIdx, data)
    );
  };

  const handleDeleteSection = (sIdx, section) => {
    openConfirm('刪除子分類', `確定要刪除「${section.title}」及其所有項目嗎？此操作無法復原。`, () => deleteSection(categoryId, sIdx));
  };

  // --- Item handlers ---
  const handleAddSimpleItem = (sIdx) => {
    openModal(
      '新增資訊項目',
      [
        { key: 'name', label: '名稱', placeholder: '例：煙霧偵測器測試' },
        { key: 'freq', label: '頻率／期限', placeholder: '例：每月' },
        { key: 'tip', label: '說明／提示', type: 'textarea', placeholder: '輸入詳細說明...' },
      ],
      {},
      (data) => addItem(categoryId, sIdx, { name: data.name, freq: data.freq || undefined, tip: data.tip || undefined }),
      true
    );
  };

  const handleAddSOPItem = (sIdx) => {
    openModal(
      '新增 SOP 項目',
      [
        { key: 'name', label: 'SOP 名稱', placeholder: '例：更換水龍頭密封圈' },
        { key: 'tip', label: '補充說明', type: 'textarea', placeholder: '可選的補充說明...' },
      ],
      {},
      (data) => addItem(categoryId, sIdx, { name: data.name, tip: data.tip || undefined, steps: [] }),
      true
    );
  };

  const handleEditSimpleItem = (sIdx, iIdx, item) => {
    openModal(
      '編輯資訊項目',
      [
        { key: 'name', label: '名稱' },
        { key: 'freq', label: '頻率／期限' },
        { key: 'tip', label: '說明／提示', type: 'textarea' },
      ],
      item,
      (data) => updateItem(categoryId, sIdx, iIdx, { name: data.name, freq: data.freq || undefined, tip: data.tip || undefined })
    );
  };

  const handleEditSOPItem = (sIdx, iIdx, item) => {
    openModal(
      '編輯 SOP 項目',
      [
        { key: 'name', label: 'SOP 名稱' },
        { key: 'tip', label: '補充說明', type: 'textarea' },
      ],
      item,
      (data) => updateItem(categoryId, sIdx, iIdx, { name: data.name, tip: data.tip || undefined })
    );
  };

  const handleDeleteItem = (sIdx, iIdx, item) => {
    openConfirm('刪除項目', `確定要刪除「${item.name}」嗎？`, () => deleteItem(categoryId, sIdx, iIdx));
  };

  // --- Step handlers ---
  const handleAddStep = (sIdx, iIdx) => {
    const stepText = window.prompt('輸入新步驟內容：');
    if (stepText && stepText.trim()) {
      addStep(categoryId, sIdx, iIdx, stepText.trim());
    }
  };

  const handleDeleteStepConfirm = (sIdx, iIdx, stIdx, stepText) => {
    openConfirm('刪除步驟', `確定要刪除此步驟嗎？「${stepText.substring(0, 50)}...」`, () => deleteStep(categoryId, sIdx, iIdx, stIdx));
  };

  // --- Recipe handlers ---
  const handleAddRecipe = (sIdx) => {
    openModal(
      '新增食譜',
      [
        { key: 'name', label: '菜式名稱', placeholder: '例：豉油雞翼' },
        { key: 'servings', label: '份量', placeholder: '2-3 人份' },
        { key: 'prepTime', label: '準備時間', placeholder: '10 分鐘' },
        { key: 'cookTime', label: '烹調時間', placeholder: '20 分鐘' },
        { key: 'ingredients', label: '材料（每行一項）', type: 'textarea', rows: 4, placeholder: '雞蛋 4 隻\n番茄 2 個' },
        { key: 'steps', label: '步驟（每行一項）', type: 'textarea', rows: 5, placeholder: '1. 打散雞蛋\n2. 切番茄' },
      ],
      {},
      (data) => addItem(categoryId, sIdx, {
        name: data.name,
        tip: data.tip || '',
        recipe: {
          servings: data.servings || '',
          prepTime: data.prepTime || '',
          cookTime: data.cookTime || '',
          ingredients: (data.ingredients || '').split('\n').filter(s => s.trim()),
          steps: (data.steps || '').split('\n').filter(s => s.trim()),
        },
      }),
      true
    );
  };

  return (
    <div className="category-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-icon" style={{ background: category.gradient }}>
            {category.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">{category.name}</h1>
            <p className="page-subtitle">
              {category.sections.length} 個分類 ·{' '}
              {category.sections.reduce((acc, s) => acc + s.items.length, 0)} 個項目
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editMode && (
              <>
                <button className="btn btn-sm btn-outline" onClick={handleEditCategory}>✏️ 編輯分類</button>
                <button className="btn btn-sm btn-primary" onClick={handleAddSection}>＋ 新增子分類</button>
              </>
            )}
            <button
              className={`btn btn-sm ${editMode ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '✓ 完成編輯' : '✏️ 客製化'}
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="category-sections">
        {category.sections.map((section, sIdx) => (
          <div
            key={sIdx}
            className={`category-section-card animate-fade-in-up ${editMode ? 'editable-section' : ''}`}
            style={{ animationDelay: `${sIdx * 0.06}s` }}
          >
            <div className="category-section-header" onClick={() => toggleSection(sIdx)}>
              <div className="category-section-icon">{section.icon}</div>
              <div className="category-section-title">{section.title}</div>
              <div className="category-section-count">
                {section.items.length} 項
                <span style={{
                  marginLeft: '8px', fontSize: '14px', transition: 'transform 0.3s ease',
                  display: 'inline-block', transform: expandedSections[sIdx] ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>▼</span>
              </div>
              {editMode && (
                <div className="edit-actions edit-actions-inline" style={{ marginLeft: '8px' }} onClick={e => e.stopPropagation()}>
                  <button className="edit-btn" onClick={() => handleEditSection(sIdx, section)} title="編輯">✏️</button>
                  <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteSection(sIdx, section)} title="刪除">🗑️</button>
                </div>
              )}
            </div>

            <div className={`category-section-body ${!expandedSections[sIdx] ? 'hidden' : ''}`}>
              {/* Special: Laundry Icons section */}
              {section.title === '洗滌標籤辨識（國際通用）' && <LaundryIcons />}

              {/* Special: Recipe section - show recipe cards */}
              {section.icon === '📖' && section.items.map((item, iIdx) => (
                <RecipeCard key={iIdx} item={item} editMode={editMode}
                  onEdit={() => {
                    if (item.recipe) {
                      openModal('編輯食譜', [
                        { key: 'name', label: '菜式名稱' },
                        { key: 'servings', label: '份量', placeholder: '2-3 人份' },
                        { key: 'prepTime', label: '準備時間', placeholder: '10 分鐘' },
                        { key: 'cookTime', label: '烹調時間', placeholder: '20 分鐘' },
                        { key: 'ingredients', label: '材料（每行一項）', type: 'textarea', rows: 5, placeholder: '雞蛋 4 隻\n番茄 2 個' },
                        { key: 'steps', label: '步驟（每行一項）', type: 'textarea', rows: 5, placeholder: '1. 打散雞蛋\n2. 切番茄' },
                      ], {
                        name: item.name,
                        servings: item.recipe?.servings || '',
                        prepTime: item.recipe?.prepTime || '',
                        cookTime: item.recipe?.cookTime || '',
                        ingredients: (item.recipe?.ingredients || []).join('\n'),
                        steps: (item.recipe?.steps || []).join('\n'),
                      }, (data) => {
                        updateItem(categoryId, sIdx, iIdx, {
                          name: data.name,
                          tip: data.tip,
                          recipe: {
                            servings: data.servings,
                            prepTime: data.prepTime,
                            cookTime: data.cookTime,
                            ingredients: data.ingredients.split('\n').filter(s => s.trim()),
                            steps: data.steps.split('\n').filter(s => s.trim()),
                          },
                        });
                      });
                    }
                  }}
                  onDelete={() => openConfirm('刪除食譜', `確定要刪除「${item.name}」嗎？`, () => deleteItem(categoryId, sIdx, iIdx))}
                />
              ))}

              {/* Normal items (non-recipe, non-laundry-labels) */}
              {section.icon !== '📖' && section.title !== '洗滌標籤辨識（國際通用）' && section.items.map((item, iIdx) => {
                const itemHasSteps = hasSteps(item);
                const isItemExpanded = expandedItems[`${sIdx}-${iIdx}`];
                const isStockItem = item.stock && item.stock.target > 0;

                return (
                  <div key={iIdx}>
                    {/* Simple info item (no steps, no stock) */}
                    {!itemHasSteps && !isStockItem && (
                      <div className={`sop-info-item ${editMode ? 'editable-row' : ''}`}>
                        <div className="sop-info-icon">{item.freq ? '🔄' : '💡'}</div>
                        <div style={{ flex: 1 }}>
                          <div className="sop-info-name">{item.name}</div>
                          {item.tip && <div className="sop-info-tip">{item.tip}</div>}
                        </div>
                        {item.freq && <span className="sop-info-freq">{item.freq}</span>}
                        {editMode && (
                          <div className="edit-actions edit-actions-inline" onClick={e => e.stopPropagation()}>
                            <button className="edit-btn" onClick={() => handleEditSimpleItem(sIdx, iIdx, item)} title="編輯">✏️</button>
                            <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteItem(sIdx, iIdx, item)} title="刪除">🗑️</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stock inventory item */}
                    {isStockItem && !itemHasSteps && (
                      <div className={`sop-info-item stock-item ${editMode ? 'editable-row' : ''}`}
                        style={{ padding: '12px' }}
                      >
                        <div className="sop-info-icon">📦</div>
                        <div style={{ flex: 1 }}>
                          <div className="sop-info-name">{item.name}</div>
                          <div className="stock-bar-container" style={{ marginTop: '8px' }}>
                            <div className="stock-bar-bg">
                              <div
                                className={`stock-bar-fill ${item.stock.current < item.stock.target ? 'low' : 'good'}`}
                                style={{ width: `${Math.min((item.stock.current / item.stock.target) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="stock-controls">
                              <button
                                className="stock-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.stock.current > 0) {
                                    updateItem(categoryId, sIdx, iIdx, {
                                      stock: { ...item.stock, current: item.stock.current - 1 },
                                    });
                                  }
                                }}
                              >−</button>
                              <span className="stock-value">
                                {item.stock.current} / {item.stock.target} {item.stock.unit}
                              </span>
                              <button
                                className="stock-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateItem(categoryId, sIdx, iIdx, {
                                    stock: { ...item.stock, current: item.stock.current + 1 },
                                  });
                                }}
                              >＋</button>
                            </div>
                          </div>
                          {item.stock.current === 0 && (
                            <div className="stock-warning">⚠️ 已用罄，請盡快補充！</div>
                          )}
                          {item.stock.current > 0 && item.stock.current < item.stock.target * 0.3 && (
                            <div className="stock-warning">⚠️ 庫存偏低，建議補充</div>
                          )}
                        </div>
                        {editMode && (
                          <div className="edit-actions edit-actions-inline" onClick={e => e.stopPropagation()}>
                            <button className="edit-btn" onClick={() => handleEditSimpleItem(sIdx, iIdx, item)} title="編輯">✏️</button>
                            <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteItem(sIdx, iIdx, item)} title="刪除">🗑️</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SOP item with steps */}
                    {itemHasSteps && (
                      <div style={{ marginBottom: '4px' }}>
                        <div
                          className={`sop-info-item ${editMode ? 'editable-row' : ''}`}
                          onClick={() => toggleItem(sIdx, iIdx)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="sop-info-icon">📋</div>
                          <div style={{ flex: 1 }}>
                            <div className="sop-info-name">
                              {item.name}
                              <span style={{
                                marginLeft: '8px', fontSize: '12px', transition: 'transform 0.3s ease',
                                display: 'inline-block', color: 'var(--text-muted)',
                                transform: isItemExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              }}>▼</span>
                            </div>
                            {item.tip && <div className="sop-info-tip">{item.tip}</div>}
                          </div>
                          <span className="sop-info-freq">{(item.steps || []).length} 步驟</span>
                          {editMode && (
                            <div className="edit-actions edit-actions-inline" onClick={e => e.stopPropagation()}>
                              <button className="edit-btn" onClick={() => handleEditSOPItem(sIdx, iIdx, item)} title="編輯">✏️</button>
                              <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteItem(sIdx, iIdx, item)} title="刪除">🗑️</button>
                            </div>
                          )}
                        </div>

                        {isItemExpanded && (
                          <div className="steps-container animate-fade-in" style={{ paddingLeft: '46px', paddingBottom: '8px' }}>
                            {(item.steps || []).map((step, stIdx) => (
                              <div key={stIdx}>
                                {editingStep && editingStep.sIdx === sIdx && editingStep.iIdx === iIdx && editingStep.stIdx === stIdx ? (
                                  <InlineStepEdit
                                    text={step}
                                    onSave={(newText) => {
                                      updateStep(categoryId, sIdx, iIdx, stIdx, newText);
                                      setEditingStep(null);
                                    }}
                                    onCancel={() => setEditingStep(null)}
                                  />
                                ) : (
                                  <div className={`step-item ${editMode ? 'editable-row' : ''}`}>
                                    <div className="step-number">{stIdx + 1}</div>
                                    <div className="step-text">{step}</div>
                                    {editMode && (
                                      <div className="edit-actions edit-actions-inline">
                                        <button className="edit-btn" onClick={() => setEditingStep({ sIdx, iIdx, stIdx })} title="編輯">✏️</button>
                                        <button className="edit-btn edit-btn-danger" onClick={() => handleDeleteStepConfirm(sIdx, iIdx, stIdx, step)} title="刪除">🗑️</button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            {editMode && (
                              <button
                                className="btn btn-sm btn-outline"
                                style={{ marginTop: '8px', alignSelf: 'flex-start' }}
                                onClick={() => handleAddStep(sIdx, iIdx)}
                              >
                                ＋ 新增步驟
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    {iIdx < section.items.length - 1 && (
                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '2px 0' }} />
                    )}
                  </div>
                );
              })}

              {/* Add item buttons in edit mode */}
              {editMode && section.icon !== '📖' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => handleAddSimpleItem(sIdx)}>＋ 資訊項目</button>
                  <button className="btn btn-sm btn-outline" onClick={() => handleAddSOPItem(sIdx)}>＋ SOP 項目</button>
                </div>
              )}
              {/* Add recipe button for recipe section */}
              {editMode && section.icon === '📖' && (
                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => handleAddRecipe(sIdx)}>＋ 新增食譜</button>
                </div>
              )}
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

/* ===== Recipe Card Component ===== */
function RecipeCard({ item, editMode, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const r = item.recipe;
  if (!r) return null;

  return (
    <div className={`recipe-card ${editMode ? 'editable-row' : ''}`}>
      <div className="recipe-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="recipe-card-icon">🍽️</div>
        <div style={{ flex: 1 }}>
          <div className="recipe-card-name">
            {item.name}
            <span className="recipe-card-toggle" style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
              transition: 'transform 0.3s ease',
              marginLeft: '8px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}>▼</span>
          </div>
          {item.tip && <div className="recipe-card-tip">{item.tip}</div>}
        </div>
        <div className="recipe-card-meta">
          <span>👥 {r.servings || '-'}</span>
          <span>⏱️ {r.prepTime || '-'} / {r.cookTime || '-'}</span>
        </div>
        {editMode && (
          <div className="edit-actions edit-actions-inline" onClick={e => e.stopPropagation()} style={{ position: 'static', opacity: 1 }}>
            <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="編輯">✏️</button>
            <button className="edit-btn edit-btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="刪除">🗑️</button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="recipe-card-body animate-fade-in">
          {/* Ingredients */}
          <div className="recipe-section">
            <div className="recipe-section-title">🥬 材料</div>
            <ul className="recipe-ingredient-list">
              {(r.ingredients || []).map((ing, i) => (
                <li key={i} className="recipe-ingredient-item">{ing}</li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="recipe-section">
            <div className="recipe-section-title">👨‍🍳 步驟</div>
            <div className="steps-container">
              {(r.steps || []).map((step, i) => (
                <div key={i} className="step-item">
                  <div className="step-number">{i + 1}</div>
                  <div className="step-text">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
