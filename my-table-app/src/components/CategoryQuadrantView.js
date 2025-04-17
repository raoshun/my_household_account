import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CategoryQuadrantView.css';

/**
 * 支出を4分類（必需固定費・必需変動費・娯楽費・浪費）で表示するコンポーネント
 * カテゴリの手動割り当て機能付き
 * 
 * @param {Object} props
 * @param {Array} props.data - 分析対象データ配列
 * @param {number} props.negativeTotal - 支出合計額（負の値）
 * @returns {JSX.Element} カテゴリ四分法ビュー
 */
const CategoryQuadrantView = ({ data = [], negativeTotal = 0 }) => {
  // 支出の絶対値（正の値）
  const expenseTotal = Math.abs(negativeTotal);
  
  // カテゴリの分類状態を保持
  const [categoryAssignments, setCategoryAssignments] = useState({});
  // 編集モード（カテゴリ割り当て画面表示）フラグ
  const [isEditingAssignments, setIsEditingAssignments] = useState(false);
  // 未分類のカテゴリリスト
  const [unassignedCategories, setUnassignedCategories] = useState([]);
  
  // 四分法データの初期化
  const [quadrantData, setQuadrantData] = useState({
    'necessary-fixed': { total: 0, percentage: 0, items: [] },
    'necessary-variable': { total: 0, percentage: 0, items: [] },
    'entertainment': { total: 0, percentage: 0, items: [] },
    'waste': { total: 0, percentage: 0, items: [] }
  });

  // 四分法名の翻訳用マッピング
  const quadrantNames = {
    'necessary-fixed': '必需費（固定）',
    'necessary-variable': '変動費（必須）',
    'entertainment': '娯楽費',
    'waste': '浪費'
  };

  // 初期化時にローカルストレージから分類設定を読み込み
  useEffect(() => {
    try {
      const savedAssignments = localStorage.getItem('categoryQuadrantAssignments');
      if (savedAssignments) {
        setCategoryAssignments(JSON.parse(savedAssignments));
      }
    } catch (error) {
      console.error('保存された分類情報の読み込みに失敗しました:', error);
    }
  }, []);
  
  // 全カテゴリを抽出して、未割り当てのカテゴリを特定
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // すべての支出カテゴリを取得（重複排除）
    const allExpenseCategories = [...new Set(
      data
        .filter(item => item['金額（円）'] < 0)
        .map(item => item['大項目'])
        .filter(Boolean)
    )];
    
    // 未割り当てのカテゴリを特定
    const unassigned = allExpenseCategories.filter(
      category => !categoryAssignments[category]
    );
    
    setUnassignedCategories(unassigned);
  }, [data, categoryAssignments]);

  // 分類情報を保存する関数
  const saveAssignments = (newAssignments) => {
    try {
      localStorage.setItem('categoryQuadrantAssignments', JSON.stringify(newAssignments));
      setCategoryAssignments(newAssignments);
    } catch (error) {
      console.error('分類情報の保存に失敗しました:', error);
    }
  };

  // カテゴリの分類を更新する関数
  const assignCategory = (category, quadrant) => {
    const newAssignments = {
      ...categoryAssignments,
      [category]: quadrant
    };
    saveAssignments(newAssignments);
  };

  // カテゴリの分類を削除する関数
  const removeAssignment = (category) => {
    const newAssignments = { ...categoryAssignments };
    delete newAssignments[category];
    saveAssignments(newAssignments);
  };

  // データを手動分類に基づいて四分法に分類
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const quadrants = {
      'necessary-fixed': { total: 0, percentage: 0, items: [] },
      'necessary-variable': { total: 0, percentage: 0, items: [] },
      'entertainment': { total: 0, percentage: 0, items: [] },
      'waste': { total: 0, percentage: 0, items: [] }
    };
    
    // データを手動割り当てに基づいて分類
    data.forEach(item => {
      // 収入や金額のないデータはスキップ
      if (item['金額（円）'] >= 0 || !item['大項目']) return;
      
      const category = item['大項目'];
      const quadrant = categoryAssignments[category];
      
      // 分類されていないカテゴリはスキップ
      if (!quadrant) return;
      
      const amount = Math.abs(Number(item['金額（円）']) || 0);
      
      // 金額と項目を該当するquadrantに追加
      quadrants[quadrant].total += amount;
      quadrants[quadrant].items.push({
        ...item,
        amount
      });
    });
    
    // 各象限のパーセンテージを計算
    if (expenseTotal > 0) {
      Object.keys(quadrants).forEach(key => {
        quadrants[key].percentage = (quadrants[key].total / expenseTotal) * 100;
        // 項目を金額の降順でソート
        quadrants[key].items.sort((a, b) => b.amount - a.amount);
      });
    }
    
    setQuadrantData(quadrants);
  }, [data, categoryAssignments, expenseTotal]);
  
  // 各象限の合計から浪費率と必需費率を計算
  const wasteRate = expenseTotal > 0 ? (quadrantData['waste'].total / expenseTotal) * 100 : 0;
  const necessityRate = expenseTotal > 0 ? 
    ((quadrantData['necessary-fixed'].total + quadrantData['necessary-variable'].total) / expenseTotal) * 100 : 0;

  // 金額をフォーマットする関数
  const formatAmount = (amount) => {
    try {
      return `¥${amount.toLocaleString()}`;
    } catch (e) {
      return `¥${amount}`;
    }
  };

  // カテゴリの分類状況の要約を計算
  const totalCategories = Object.keys(unassignedCategories).length + Object.keys(categoryAssignments).length;
  const assignedCount = Object.keys(categoryAssignments).length;
  const assignmentProgress = totalCategories > 0 ? (assignedCount / totalCategories) * 100 : 0;

  // 分類編集画面
  const renderAssignmentEditor = () => {
    return (
      <div className="category-assignment-editor">
        <h3>カテゴリを4分法に割り当てる</h3>
        
        <div className="assignment-progress">
          <div className="progress-label">
            割り当て済み: {assignedCount} / {totalCategories} カテゴリ ({Math.round(assignmentProgress)}%)
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${assignmentProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="assignment-sections">
          {/* 未割り当てカテゴリ */}
          <div className="assignment-section">
            <h4>未分類のカテゴリ</h4>
            <div className="unassigned-categories">
              {unassignedCategories.length > 0 ? (
                unassignedCategories.map(category => (
                  <div className="category-assignment-item" key={`unassigned-${category}`}>
                    <span className="category-name">{category}</span>
                    <select 
                      className="quadrant-selector"
                      onChange={(e) => assignCategory(category, e.target.value)}
                      value=""
                    >
                      <option value="" disabled>選択してください</option>
                      <option value="necessary-fixed">必需費（固定）</option>
                      <option value="necessary-variable">変動費（必須）</option>
                      <option value="entertainment">娯楽費</option>
                      <option value="waste">浪費</option>
                    </select>
                  </div>
                ))
              ) : (
                <p className="no-categories-message">未分類のカテゴリはありません</p>
              )}
            </div>
          </div>
          
          {/* 割り当て済みカテゴリ */}
          <div className="assignment-section">
            <h4>割り当て済みカテゴリ</h4>
            <div className="assigned-categories">
              {Object.keys(categoryAssignments).length > 0 ? (
                Object.entries(categoryAssignments).map(([category, quadrant]) => (
                  <div className="category-assignment-item" key={`assigned-${category}`}>
                    <span className="category-name">{category}</span>
                    <div className="assignment-actions">
                      <select 
                        className={`quadrant-selector quadrant-${quadrant}`}
                        value={quadrant}
                        onChange={(e) => assignCategory(category, e.target.value)}
                      >
                        <option value="necessary-fixed">必需費（固定）</option>
                        <option value="necessary-variable">変動費（必須）</option>
                        <option value="entertainment">娯楽費</option>
                        <option value="waste">浪費</option>
                      </select>
                      <button 
                        className="remove-assignment-btn"
                        onClick={() => removeAssignment(category)}
                        title="割り当てを削除"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-categories-message">割り当て済みのカテゴリはありません</p>
              )}
            </div>
          </div>
        </div>

        <div className="assignment-actions-container">
          <button 
            className="done-editing-btn"
            onClick={() => setIsEditingAssignments(false)}
          >
            完了
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="category-quadrant-container">
      <h2 className="category-quadrant-title">支出カテゴリ四分法</h2>
      
      <div className="quadrant-explanation">
        <h3>四分法とは？</h3>
        <p>支出を以下の4つのカテゴリに分類して可視化します：</p>
        <p>①<strong>必需費（固定）</strong>：家賃・光熱費など、生活に必須の固定費</p>
        <p>②<strong>変動費（必須）</strong>：食費・日用品など、生活に必須だが金額が変動するもの</p>
        <p>③<strong>娯楽費</strong>：趣味・外食など、削減可能な費用</p>
        <p>④<strong>浪費</strong>：無駄遣い・衝動買いなど、削減すべき費用</p>
      </div>
      
      {/* 分類設定ボタン */}
      <div className="assignment-toggle-container">
        <button 
          className="edit-assignments-btn"
          onClick={() => setIsEditingAssignments(!isEditingAssignments)}
        >
          {isEditingAssignments ? 'キャンセル' : 'カテゴリの分類を設定'}
        </button>
        
        {!isEditingAssignments && (
          <div className="assignment-status">
            {assignedCount > 0 ? (
              <>
                <span>{assignedCount}個のカテゴリを分類済み</span>
                <div className="mini-progress">
                  <div 
                    className="mini-progress-fill" 
                    style={{ width: `${assignmentProgress}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <span className="no-assignments">カテゴリが未分類です</span>
            )}
          </div>
        )}
      </div>
      
      {/* 編集モードの場合は分類エディタを表示 */}
      {isEditingAssignments ? (
        renderAssignmentEditor()
      ) : (
        <>
          {/* メインの四分法表示 */}
          {assignedCount > 0 ? (
            <>
              <div className="quadrant-graph-container">
                <div className="quadrant-grid">
                  {/* 象限1: 必需費（固定） */}
                  <div className="quadrant quadrant-1">
                    <div className="quadrant-title">
                      <span className="quadrant-icon">🏠</span>
                      必需費（固定）
                    </div>
                    <div className="quadrant-categories">
                      {quadrantData['necessary-fixed'].items.length > 0 ? (
                        quadrantData['necessary-fixed'].items.slice(0, 10).map((item, index) => (
                          <div className="category-item" key={`fixed-${index}`}>
                            <span className="category-name">
                              {item['大項目'] || '未分類'}
                              <span className="category-amount">{formatAmount(item.amount)}</span>
                            </span>
                            <div className="category-bar">
                              <div 
                                className="category-fill" 
                                style={{ 
                                  width: `${(item.amount / quadrantData['necessary-fixed'].total * 100).toFixed(1)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data-message">データがありません</div>
                      )}
                      {quadrantData['necessary-fixed'].items.length > 10 && (
                        <div className="more-items">他 {quadrantData['necessary-fixed'].items.length - 10} 項目</div>
                      )}
                    </div>
                    <div className="quadrant-total">
                      {formatAmount(quadrantData['necessary-fixed'].total)}
                      <span className="quadrant-percentage">
                        {quadrantData['necessary-fixed'].percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 象限2: 変動費（必須） */}
                  <div className="quadrant quadrant-2">
                    <div className="quadrant-title">
                      <span className="quadrant-icon">🍎</span>
                      変動費（必須）
                    </div>
                    <div className="quadrant-categories">
                      {quadrantData['necessary-variable'].items.length > 0 ? (
                        quadrantData['necessary-variable'].items.slice(0, 10).map((item, index) => (
                          <div className="category-item" key={`var-${index}`}>
                            <span className="category-name">
                              {item['大項目'] || '未分類'}
                              <span className="category-amount">{formatAmount(item.amount)}</span>
                            </span>
                            <div className="category-bar">
                              <div 
                                className="category-fill" 
                                style={{ 
                                  width: `${(item.amount / quadrantData['necessary-variable'].total * 100).toFixed(1)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data-message">データがありません</div>
                      )}
                      {quadrantData['necessary-variable'].items.length > 10 && (
                        <div className="more-items">他 {quadrantData['necessary-variable'].items.length - 10} 項目</div>
                      )}
                    </div>
                    <div className="quadrant-total">
                      {formatAmount(quadrantData['necessary-variable'].total)}
                      <span className="quadrant-percentage">
                        {quadrantData['necessary-variable'].percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 象限3: 娯楽費 */}
                  <div className="quadrant quadrant-3">
                    <div className="quadrant-title">
                      <span className="quadrant-icon">🎮</span>
                      娯楽費
                    </div>
                    <div className="quadrant-categories">
                      {quadrantData['entertainment'].items.length > 0 ? (
                        quadrantData['entertainment'].items.slice(0, 10).map((item, index) => (
                          <div className="category-item" key={`ent-${index}`}>
                            <span className="category-name">
                              {item['大項目'] || '未分類'}
                              <span className="category-amount">{formatAmount(item.amount)}</span>
                            </span>
                            <div className="category-bar">
                              <div 
                                className="category-fill" 
                                style={{ 
                                  width: `${(item.amount / quadrantData['entertainment'].total * 100).toFixed(1)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data-message">データがありません</div>
                      )}
                      {quadrantData['entertainment'].items.length > 10 && (
                        <div className="more-items">他 {quadrantData['entertainment'].items.length - 10} 項目</div>
                      )}
                    </div>
                    <div className="quadrant-total">
                      {formatAmount(quadrantData['entertainment'].total)}
                      <span className="quadrant-percentage">
                        {quadrantData['entertainment'].percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 象限4: 浪費 */}
                  <div className="quadrant quadrant-4">
                    <div className="quadrant-title">
                      <span className="quadrant-icon">💸</span>
                      浪費
                    </div>
                    <div className="quadrant-categories">
                      {quadrantData['waste'].items.length > 0 ? (
                        quadrantData['waste'].items.slice(0, 10).map((item, index) => (
                          <div className="category-item" key={`waste-${index}`}>
                            <span className="category-name">
                              {item['大項目'] || '未分類'}
                              <span className="category-amount">{formatAmount(item.amount)}</span>
                            </span>
                            <div className="category-bar">
                              <div 
                                className="category-fill" 
                                style={{ 
                                  width: `${(item.amount / quadrantData['waste'].total * 100).toFixed(1)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data-message">データがありません</div>
                      )}
                      {quadrantData['waste'].items.length > 10 && (
                        <div className="more-items">他 {quadrantData['waste'].items.length - 10} 項目</div>
                      )}
                    </div>
                    <div className="quadrant-total">
                      {formatAmount(quadrantData['waste'].total)}
                      <span className="quadrant-percentage">
                        {quadrantData['waste'].percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="quadrant-summary">
                <h3>支出分析まとめ</h3>
                
                <div className="rate-indicator">
                  <div className="rate-box necessity-rate">
                    <div className="rate-title">必需費率</div>
                    <div className="rate-value">{necessityRate.toFixed(1)}%</div>
                  </div>
                  <div className="rate-box waste-rate">
                    <div className="rate-title">浪費率</div>
                    <div className="rate-value">{wasteRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              
              <div className="quadrant-advice">
                <h3>改善アドバイス</h3>
                <div className="advice-content">
                  {wasteRate > 20 ? (
                    <>
                      <h4>浪費を削減しましょう</h4>
                      <p>浪費の割合が高くなっています。以下のポイントを意識して支出を見直してみましょう：</p>
                      <ul>
                        <li>衝動買いを避けるため、購入前に24時間考える時間を持つ</li>
                        <li>使っていないサブスクリプションや会員費を見直す</li>
                        <li>買い物前にリストを作り、それに従って購入する</li>
                      </ul>
                    </>
                  ) : wasteRate < 5 ? (
                    <>
                      <h4>素晴らしい支出バランスです</h4>
                      <p>浪費の割合が非常に低く、賢い支出管理ができています。この調子を維持しましょう。</p>
                    </>
                  ) : (
                    <>
                      <h4>バランスの取れた支出です</h4>
                      <p>浪費と必要な支出のバランスが取れています。さらに改善するためのヒント：</p>
                      <ul>
                        <li>定期的に支出をレビューし、ムダを見つける習慣をつける</li>
                        <li>必需品でもよりお得な選択肢がないか検討する</li>
                      </ul>
                    </>
                  )}

                  {necessityRate > 70 ? (
                    <>
                      <h4>固定費の見直しも検討しましょう</h4>
                      <p>必需費の割合が高くなっています。長期的な視点で以下の見直しも効果的かもしれません：</p>
                      <ul>
                        <li>より家賃の安い物件への引っ越しを検討する</li>
                        <li>公共料金プランの見直しや省エネ対策</li>
                        <li>保険や通信費などの契約内容の見直し</li>
                      </ul>
                    </>
                  ) : necessityRate < 40 ? (
                    <>
                      <h4>貯蓄を増やしましょう</h4>
                      <p>必需費の割合が比較的低いため、余裕があります。この機会に貯蓄や投資を増やすことを検討しましょう。</p>
                    </>
                  ) : (
                    <>
                      <h4>バランスの良い家計です</h4>
                      <p>必需費と選択的支出のバランスが取れています。定期的な見直しを続けましょう。</p>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-assignments-guide">
              <h3>カテゴリを分類してください</h3>
              <p>カテゴリ四分法による分析を行うには、まず支出カテゴリを4つの分類に割り当てる必要があります。</p>
              <p>「カテゴリの分類を設定」ボタンをクリックして、各カテゴリをどの分類に含めるか設定してください。</p>
              <div className="guide-image">
                <span className="large-icon">🧩</span>
              </div>
              <button 
                className="start-assignment-btn"
                onClick={() => setIsEditingAssignments(true)}
              >
                カテゴリの分類を開始する
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

CategoryQuadrantView.propTypes = {
  data: PropTypes.array,
  negativeTotal: PropTypes.number
};

export default CategoryQuadrantView;