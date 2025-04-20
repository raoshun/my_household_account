// @ts-nocheck
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CategoryQuadrantView.css';

/**
 * 支出を4分類（必需固定・必需変動・娯楽固定・娯楽変動）で表示するコンポーネント
 * カテゴリの手動割り当て機能付き（ドラッグアンドドロップ対応）
 * 
 * @param {Object} props
 * @param {Array} props.data - 分析対象データ配列
 * @param {number} props.negativeTotal - 支出合計額（負の値）
 * @returns {React.ReactElement} カテゴリ四分法ビュー
 */
const CategoryQuadrantView = ({ data = [], negativeTotal = 0 }) => {
  // 支出の絶対値（正の値）
  const expenseTotal = Math.abs(negativeTotal);
  
  // カテゴリの分類状態を保持
  const [categoryAssignments, setCategoryAssignments] = useState({});
  // 未分類のカテゴリリスト
  /** @type {string[]} */
  const [unassignedCategories, setUnassignedCategories] = useState([]);
  // ドラッグ中のカテゴリ
  const [draggedCategory, setDraggedCategory] = useState(null);
  
  // 四分法データの初期化
  /** 
   * @typedef {Object} QuadrantItem
   * @property {number} amount - 金額
   * @property {string} 大項目 - カテゴリ名
   * 
   * @typedef {Object} QuadrantData
   * @property {number} total - 合計金額
   * @property {number} percentage - 割合
   * @property {QuadrantItem[]} items - 該当データ項目
   */
  
  const [quadrantData, setQuadrantData] = useState({
    'necessary-fixed': { total: 0, percentage: 0, items: [] },
    'necessary-variable': { total: 0, percentage: 0, items: [] },
    'leisure-fixed': { total: 0, percentage: 0, items: [] },
    'leisure-variable': { total: 0, percentage: 0, items: [] }
  });

  // 四分法名の翻訳用マッピング
  const quadrantNames = {
    'necessary-fixed': '必需費（固定）',
    'necessary-variable': '必需費（変動）',
    'leisure-fixed': '娯楽費（固定）',
    'leisure-variable': '娯楽費（変動）'
  };

  // 四分法アイコンマッピング
  const quadrantIcons = {
    'necessary-fixed': '🏠',
    'necessary-variable': '🍎',
    'leisure-fixed': '🎮',
    'leisure-variable': '💸'
  };

  // 初期化時にローカルストレージから分類設定を読み込み
  useEffect(() => {
    try {
      const savedAssignments = localStorage.getItem('categoryQuadrantAssignments');
      if (savedAssignments) {
        // 旧フォーマットの変換（互換性のため）
        const parsedAssignments = JSON.parse(savedAssignments);
        const convertedAssignments = {};
        
        Object.entries(parsedAssignments).forEach(([category, quadrant]) => {
          // 旧フォーマットから新フォーマットへの変換マッピング
          const conversionMap = {
            'necessary-fixed': 'necessary-fixed',
            'necessary-variable': 'necessary-variable',
            'entertainment': 'leisure-fixed',
            'waste': 'leisure-variable'
          };
          
          convertedAssignments[category] = conversionMap[quadrant] || quadrant;
        });
        
        setCategoryAssignments(convertedAssignments);
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

  // ドラッグ開始時の処理
  const handleDragStart = (e, category) => {
    setDraggedCategory(category);
    e.dataTransfer.setData('text/plain', category);
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドラッグ終了時の処理
  const handleDragEnd = () => {
    setDraggedCategory(null);
  };

  // ドラッグオーバー時の処理
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // ドロップ時の処理
  const handleDrop = (e, quadrant) => {
    e.preventDefault();
    const category = e.dataTransfer.getData('text/plain');
    if (category) {
      assignCategory(category, quadrant);
    }
  };

  // データを手動分類に基づいて四分法に分類
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const quadrants = {
      'necessary-fixed': { total: 0, percentage: 0, items: [] },
      'necessary-variable': { total: 0, percentage: 0, items: [] },
      'leisure-fixed': { total: 0, percentage: 0, items: [] },
      'leisure-variable': { total: 0, percentage: 0, items: [] }
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
  
  // 各象限の合計から必需費率と固定費率を計算
  const necessaryRate = expenseTotal > 0 ? 
    ((quadrantData['necessary-fixed'].total + quadrantData['necessary-variable'].total) / expenseTotal) * 100 : 0;
  const fixedRate = expenseTotal > 0 ? 
    ((quadrantData['necessary-fixed'].total + quadrantData['leisure-fixed'].total) / expenseTotal) * 100 : 0;

  // 金額をフォーマットする関数
  const formatAmount = (amount) => {
    try {
      return `¥${amount.toLocaleString()}`;
    } catch (e) {
      return `¥${amount}`;
    }
  };

  // カテゴリの分類状況の要約を計算
  const totalCategories = unassignedCategories.length + Object.keys(categoryAssignments).length;
  const assignedCount = Object.keys(categoryAssignments).length;
  const assignmentProgress = totalCategories > 0 ? (assignedCount / totalCategories) * 100 : 0;

  // 象限内のカテゴリ表示をレンダリングする関数
  const renderQuadrantCategories = (quadrant) => {
    return (
      <div className="quadrant-categories-container">
        <div 
          className="quadrant-categories droppable-area"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, quadrant)}
        >
          {/* データアイテムを表示せず、割り当てられたカテゴリのみ表示 */}
          <div className="quadrant-summary-info">
            {formatAmount(quadrantData[quadrant].total)}
            <span className="quadrant-percentage">
              {quadrantData[quadrant].percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* 割り当て済みカテゴリ（ドラッグ可能なタグ形式） */}
        <div className="assigned-category-tags">
          {Object.entries(categoryAssignments)
            .filter(([_, assignedQuadrant]) => assignedQuadrant === quadrant)
            .map(([category]) => (
              <div 
                key={`tag-${category}`}
                className={`category-tag ${draggedCategory === category ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, category)}
                onDragEnd={handleDragEnd}
              >
                {category}
                <button 
                  className="remove-category-tag"
                  onClick={() => removeAssignment(category)}
                  title="削除"
                >×</button>
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  return (
    <div className="category-quadrant-container">
      <h2 className="category-quadrant-title">支出カテゴリ四分法</h2>
      
      <div className="quadrant-explanation">
        <h3>四分法とは？</h3>
        <p>支出を「必要性」と「変動性」の2軸で4つのカテゴリに分類して可視化します：</p>
        <p>①<strong>必需費（固定）</strong>：家賃・光熱費など、生活に必須で毎月固定的に発生する費用</p>
        <p>②<strong>必需費（変動）</strong>：食費・日用品など、生活に必須だが金額が変動する費用</p>
        <p>③<strong>娯楽費（固定）</strong>：定額サブスクなど、楽しみのために定期的に支払う固定費用</p>
        <p>④<strong>娯楽費（変動）</strong>：外食・遊び・衝動買いなど、削減可能な変動費用</p>
      </div>
      
      {/* 分類状況の表示 */}
      <div className="assignment-status-container">
        <div className="assignment-status">
          {assignedCount > 0 ? (
            <>
              <span>{assignedCount}個のカテゴリを分類済み</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${assignmentProgress}%` }}
                ></div>
              </div>
            </>
          ) : (
            <span className="no-assignments">カテゴリが未分類です</span>
          )}
        </div>
      </div>
      
      {/* 未分類カテゴリセクション */}
      <div className="unassigned-categories-section">
        <h3>未分類のカテゴリ（ドラッグして象限に割り当ててください）</h3>
        <div className="unassigned-categories-list">
          {unassignedCategories.length > 0 ? (
            unassignedCategories.map(category => (
              <div 
                key={`unassigned-${category}`}
                className={`unassigned-category-item ${draggedCategory === category ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, category)}
                onDragEnd={handleDragEnd}
              >
                {category}
              </div>
            ))
          ) : (
            <p className="no-categories-message">未分類のカテゴリはありません</p>
          )}
        </div>
      </div>
      
      {/* メインの四分法表示（ドラッグアンドドロップ可能） */}
      {totalCategories > 0 && (
        <>
          <div className="quadrant-graph-container">
            <div className="quadrant-grid">
              {/* 象限軸のラベル */}
              <div className="x-axis-label-low">必需</div>
              <div className="x-axis-label-high">娯楽</div>
              <div className="y-axis-label-low">変動</div>
              <div className="y-axis-label-high">固定</div>
              <div className="x-axis-title">必要性</div>
              <div className="y-axis-title">変動性</div>
              
              {/* 象限1: 必需費（固定） - 左上 */}
              <div 
                className="quadrant quadrant-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'necessary-fixed')}
              >
                <div className="quadrant-title">
                  <span className="quadrant-icon">{quadrantIcons['necessary-fixed']}</span>
                  {quadrantNames['necessary-fixed']}
                </div>
                {renderQuadrantCategories('necessary-fixed')}
                <div className="quadrant-total">
                  {formatAmount(quadrantData['necessary-fixed'].total)}
                  <span className="quadrant-percentage">
                    {quadrantData['necessary-fixed'].percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 象限2: 娯楽費（固定） - 右上 */}
              <div 
                className="quadrant quadrant-2"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'leisure-fixed')}
              >
                <div className="quadrant-title">
                  <span className="quadrant-icon">{quadrantIcons['leisure-fixed']}</span>
                  {quadrantNames['leisure-fixed']}
                </div>
                {renderQuadrantCategories('leisure-fixed')}
                <div className="quadrant-total">
                  {formatAmount(quadrantData['leisure-fixed'].total)}
                  <span className="quadrant-percentage">
                    {quadrantData['leisure-fixed'].percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 象限3: 必需費（変動） - 左下 */}
              <div 
                className="quadrant quadrant-3"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'necessary-variable')}
              >
                <div className="quadrant-title">
                  <span className="quadrant-icon">{quadrantIcons['necessary-variable']}</span>
                  {quadrantNames['necessary-variable']}
                </div>
                {renderQuadrantCategories('necessary-variable')}
                <div className="quadrant-total">
                  {formatAmount(quadrantData['necessary-variable'].total)}
                  <span className="quadrant-percentage">
                    {quadrantData['necessary-variable'].percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 象限4: 娯楽費（変動） - 右下 */}
              <div 
                className="quadrant quadrant-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'leisure-variable')}
              >
                <div className="quadrant-title">
                  <span className="quadrant-icon">{quadrantIcons['leisure-variable']}</span>
                  {quadrantNames['leisure-variable']}
                </div>
                {renderQuadrantCategories('leisure-variable')}
                <div className="quadrant-total">
                  {formatAmount(quadrantData['leisure-variable'].total)}
                  <span className="quadrant-percentage">
                    {quadrantData['leisure-variable'].percentage.toFixed(1)}%
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
                <div className="rate-value">{necessaryRate.toFixed(1)}%</div>
              </div>
              <div className="rate-box fixed-rate">
                <div className="rate-title">固定費率</div>
                <div className="rate-value">{fixedRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>
          
          <div className="quadrant-advice">
            <h3>改善アドバイス</h3>
            <div className="advice-content">
              {necessaryRate < 40 ? (
                <>
                  <h4>必需費の割合が低いです</h4>
                  <p>娯楽費の割合が高くなっています。以下のポイントを意識して支出を見直してみましょう：</p>
                  <ul>
                    <li>貯蓄や投資に回せる余裕があります</li>
                    <li>衝動買いを避け、購入前に24時間考える時間を持つ</li>
                    <li>使っていないサブスクリプションや会員費を見直す</li>
                  </ul>
                </>
              ) : necessaryRate > 70 ? (
                <>
                  <h4>必需費の割合が高いです</h4>
                  <p>生活必需品への支出が多くなっています。長期的には以下のことを検討しましょう：</p>
                  <ul>
                    <li>家賃や公共料金プランの見直し</li>
                    <li>まとめ買いや電気・ガス・水道の使用量削減</li>
                    <li>食費の節約（自炊、セール品の活用など）</li>
                  </ul>
                </>
              ) : (
                <>
                  <h4>バランスの取れた支出です</h4>
                  <p>必需費と娯楽費のバランスが取れています。さらに改善するためのヒント：</p>
                  <ul>
                    <li>定期的に支出をレビューし続ける</li>
                    <li>長期的な資産形成を意識する</li>
                  </ul>
                </>
              )}

              {fixedRate > 60 ? (
                <>
                  <h4>固定費の見直しも検討しましょう</h4>
                  <p>固定費の割合が高くなっています。以下のような見直しを検討してみましょう：</p>
                  <ul>
                    <li>家賃やローン、保険料などの見直し</li>
                    <li>サブスクリプションサービスの必要性を再確認</li>
                    <li>光熱費・通信費の契約プラン見直し</li>
                  </ul>
                </>
              ) : fixedRate < 30 ? (
                <>
                  <h4>変動費管理が重要です</h4>
                  <p>変動費の割合が高いため、日々の支出管理がとても重要です：</p>
                  <ul>
                    <li>買い物リストを作って計画的に購入する</li>
                    <li>日々の支出を細かく記録し分析する</li>
                    <li>必要に応じて一部の変動費を定額化することも検討（食費の予算固定など）</li>
                  </ul>
                </>
              ) : (
                <>
                  <h4>バランスの良い固定費/変動費の比率です</h4>
                  <p>固定費と変動費のバランスが取れています。定期的な見直しを続けましょう。</p>
                </>
              )}
            </div>
          </div>
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