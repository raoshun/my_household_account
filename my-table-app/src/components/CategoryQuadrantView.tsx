import type { CategoryQuadrantViewProps } from '../types';
import React, { useState, useEffect } from 'react';
import './CategoryQuadrantView.css';

/**
 * 支出を4分類（必需固定・必需変動・娯楽固定・娯楽変動）で表示するコンポーネント
 * カテゴリ（中項目単位）の手動割り当て機能付き（ドラッグアンドドロップ対応）
 * 
 * @param {Object} props
 * @param {Array} props.data - 分析対象データ配列
 * @param {number} props.negativeTotal - 支出合計額（負の値）
 * @returns {React.ReactElement} カテゴリ四分法ビュー
 */
const CategoryQuadrantView: React.FC<CategoryQuadrantViewProps> = ({ data = [], negativeTotal = 0 }) => {
  // 支出の絶対値（正の値）
  const expenseTotal = Math.abs(negativeTotal);
  
  // カテゴリの分類状態を保持 (キーは「大項目 - 中項目」)
  const [categoryAssignments, setCategoryAssignments] = useState({});
  // 未分類のカテゴリリスト (要素は「大項目 - 中項目」) -> グループ化された構造に変更
  /** @type {{ [mainCategory: string]: string[] }} */
  const [groupedUnassignedCategories, setGroupedUnassignedCategories] = useState({});
  // ドラッグ中のカテゴリ (「大項目 - 中項目」)
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

  // --- ネスト構造⇔フラット構造変換 ---
  // フラット→ネスト
  const toNestedAssignments = (flat) => {
    const nested = {};
    Object.entries(flat).forEach(([key, value]) => {
      const [main, sub] = key.split(' - ');
      if (!main || !sub) return;
      if (!nested[main]) nested[main] = {};
      nested[main][sub] = value;
    });
    return nested;
  };
  // ネスト→フラット
  const toFlatAssignments = (nested) => {
    const flat = {};
    Object.entries(nested).forEach(([main, subs]) => {
      if (typeof subs !== 'object' || subs === null) return;
      Object.entries(subs).forEach(([sub, value]) => {
        flat[`${main} - ${sub}`] = value;
      });
    });
    return flat;
  };

  // 初期化時にローカルストレージから分類設定を読み込み
  useEffect(() => {
    console.log('localStorage(categoryQuadrantAssignments):', localStorage.getItem('categoryQuadrantAssignments'));
    try {
      const savedAssignments = localStorage.getItem('categoryQuadrantAssignments');
      if (savedAssignments) {
        // 新しいフォーマット（キーが「大項目 - 中項目」）のみを読み込む
        const parsedAssignments = JSON.parse(savedAssignments);
        // 簡単なバリデーション（オブジェクトであることを確認）
        if (typeof parsedAssignments === 'object' && parsedAssignments !== null) {
          setCategoryAssignments(parsedAssignments);
        } else {
          console.warn('ローカルストレージの分類データ形式が不正です。');
          // 不正なデータはクリアする
          localStorage.removeItem('categoryQuadrantAssignments');
        }
      }
    } catch (error) {
      console.error('保存された分類情報の読み込みに失敗しました:', error);
      // エラー時もクリアする
      localStorage.removeItem('categoryQuadrantAssignments');
    }
  }, []);
  
  // 全カテゴリ（中項目単位）を抽出して、未割り当てのカテゴリを特定し、グループ化
  useEffect(() => {
    if (!data || data.length === 0) {
      setGroupedUnassignedCategories({}); // データがない場合は空にする
      return;
    }
    
    // すべての支出カテゴリ（「大項目 - 中項目」）を取得（重複排除）
    const allExpenseCategories = [...new Set(
      data
        .filter(item => item['金額（円）'] < 0 && item['大項目'] && item['中項目']) // 中項目が存在する支出データのみ対象
        .map(item => `${item['大項目']} - ${item['中項目']}`) // 「大項目 - 中項目」形式のキーを作成
        .filter(Boolean) // 空文字などを除外
    )];
    
    // 未割り当てのカテゴリキーを特定
    const unassignedCategoryKeys = allExpenseCategories.filter(
      categoryKey => !categoryAssignments[categoryKey] // キーで存在確認
    );

    // 未割り当てカテゴリを大項目ごとにグループ化
    const grouped = unassignedCategoryKeys.reduce((acc, categoryKey) => {
      const parts = categoryKey.split(' - ');
      if (parts.length === 2) {
        const [mainCategory, subCategory] = parts;
        if (!acc[mainCategory]) {
          acc[mainCategory] = [];
        }
        // 重複を避けて追加（念のため）
        if (!acc[mainCategory].includes(subCategory)) {
          acc[mainCategory].push(subCategory);
        }
      }
      return acc;
    }, {});

    // 大項目名でソート
    const sortedGrouped = Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        // 中項目もソート
        acc[key] = grouped[key].sort();
        return acc;
      }, {});

    setGroupedUnassignedCategories(sortedGrouped);
    
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
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  // ドロップ時の処理 (修正案)
  const handleDrop = (e, quadrant) => {
    e.preventDefault();
    let category;
    try {
      // テストでモックされている dataTransfer.getData を優先的に試す
      category = e.dataTransfer.getData('text/plain');
      console.log('Using dataTransfer.getData:', category);
    } catch (error) {
      console.warn('e.dataTransfer.getData failed:', error);
      // dataTransfer が失敗した場合のみ state をフォールバックとして使用
      if (draggedCategory) {
        console.log('Using draggedCategory state as fallback:', draggedCategory);
        category = draggedCategory;
      }
    }

    if (category) {
      console.log(`Assigning category ${category} to quadrant ${quadrant}`);
      assignCategory(category, quadrant);
    } else {
      console.warn('ドロップされたカテゴリが特定できませんでした');
    }
  };

  // --- 設定エクスポート・インポート機能 ---
  // エクスポート処理
  const handleExportAssignments = () => {
    const nested = toNestedAssignments(categoryAssignments);
    const dataStr = JSON.stringify(nested, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'categoryQuadrantAssignments.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // インポート処理
  const handleImportAssignments = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('File content is not a string');
        }
        const imported = JSON.parse(result);
        if (typeof imported === 'object' && imported !== null) {
          const flat = toFlatAssignments(imported);
          saveAssignments(flat);
          alert('設定をインポートしました');
        } else {
          alert('不正なファイル形式です');
        }
      } catch (error) {
        alert('ファイルの読み込みに失敗しました');
        console.error('Import failed:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
      // 収入や金額のないデータ、大項目・中項目がないデータはスキップ
      if (item['金額（円）'] >= 0 || !item['大項目'] || !item['中項目']) return;
      
      const categoryKey = `${item['大項目']} - ${item['中項目']}`; // 「大項目 - 中項目」キー
      const quadrant = categoryAssignments[categoryKey]; // キーで分類を取得
      
      // 分類されていないカテゴリはスキップ
      if (!quadrant) return;
      
      const amount = Math.abs(Number(item['金額（円）']) || 0);
      
      // 金額と項目を該当quadrantに追加
      quadrants[quadrant].total += amount;
      quadrants[quadrant].items.push({
        ...item,
        amount,
        categoryKey // デバッグ用にキーも追加
      });
    });
    
    // 各象限のパーセンテージを計算
    if (expenseTotal > 0) {
      Object.keys(quadrants).forEach(key => {
        quadrants[key].percentage = (quadrants[key].total / expenseTotal) * 100;
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
    } catch (error) {
      console.error('Formatting amount failed:', error);
      return `¥${amount}`;
    }
  };

  // カテゴリの分類状況の要約を計算
  // totalCategoriesの計算方法をgroupedUnassignedCategoriesに合わせて変更
  const totalAssignedCount = Object.keys(categoryAssignments).length;
  const totalUnassignedCount = Object.values(groupedUnassignedCategories).reduce((sum, arr) => sum + ((arr as string[])?.length ?? 0), 0);
  const totalCategories = totalAssignedCount + totalUnassignedCount;
  const assignmentProgress = totalCategories > 0 ? (totalAssignedCount / totalCategories) * 100 : 0;

  // 象限内のカテゴリ表示をレンダリングする関数
  const renderQuadrantCategories = (quadrant) => {
    // 該当象限に割り当てられたカテゴリキーを取得
    const assignedKeysInQuadrant = Object.entries(categoryAssignments)
      .filter(([_categoryKey, assignedQuadrant]) => assignedQuadrant === quadrant)
      .map(([categoryKey]) => categoryKey);

    // 割り当てられたカテゴリを大項目ごとにグループ化
    const groupedAssigned = assignedKeysInQuadrant.reduce((acc, categoryKey) => {
      const parts = categoryKey.split(' - ');
      if (parts.length === 2) {
        const [mainCategory, subCategory] = parts;
        if (!acc[mainCategory]) {
          acc[mainCategory] = [];
        }
        if (!acc[mainCategory].includes(subCategory)) {
          acc[mainCategory].push(subCategory);
        }
      }
      return acc;
    }, {});

    // 大項目名でソート
    const sortedGroupArray = Object.entries(groupedAssigned).sort(([a], [b]) => a.localeCompare(b));
    // 各グループ内も中項目でソート
    sortedGroupArray.forEach(([_mainCategory, subCategories], idx) => {
      sortedGroupArray[idx][1] = (subCategories as string[]).slice().sort();
    });

    return (
      <div className="quadrant-categories-container">
        {/* ドロップ可能なエリアと合計金額表示 */}
        <div 
          className="quadrant-categories droppable-area"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, quadrant)}
        >
          <div className="quadrant-summary-info">
            {formatAmount(quadrantData[quadrant].total)}
            <span className="quadrant-percentage">
              {quadrantData[quadrant].percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* 割り当て済みカテゴリ（グループ化して表示） */}
        <div className="assigned-category-tags">
          {sortedGroupArray.length > 0 ? (
            sortedGroupArray.map(([mainCategory, subCategories]) => (
              <div key={`assigned-group-${quadrant}-${mainCategory}`} className="assigned-category-group">
                <h5 className="assigned-main-category-header">{mainCategory}</h5>
                <div className="assigned-subcategory-tags">
                  {subCategories.map(subCategory => {
                    const categoryKey = `${mainCategory} - ${subCategory}`;
                    return (
                      <div 
                        key={`tag-${categoryKey}`}
                        className={`category-tag ${draggedCategory === categoryKey ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, categoryKey)}
                        onDragEnd={handleDragEnd}
                      >
                        {subCategory}
                        <button 
                          className="remove-category-tag"
                          onClick={() => removeAssignment(categoryKey)}
                          title="削除"
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="no-assigned-categories">カテゴリ未割り当て</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="category-quadrant-container">
      {console.log('CategoryQuadrantView rendered')}
      <h2 className="category-quadrant-title">支出カテゴリ四分法</h2>

      {/* 設定エクスポート・インポートボタン */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={handleExportAssignments} type="button">設定をエクスポート</button>
        <label style={{ display: 'inline-block', cursor: 'pointer', margin: 0 }}>
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImportAssignments} />
          <span style={{ border: '1px solid #ccc', padding: '6px 12px', borderRadius: 4, background: '#f7f7f7' }}>設定をインポート</span>
        </label>
      </div>

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
          {totalAssignedCount > 0 ? ( // assignedCount を totalAssignedCount に変更
            <>
              <span>{totalAssignedCount}個の中項目カテゴリを分類済み</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${assignmentProgress}%` }}
                ></div>
              </div>
            </>
          ) : (
            <span className="no-assignments">中項目カテゴリが未分類です</span>
          )}
        </div>
      </div>
      
      {/* 未分類カテゴリセクション */}
      <div className="unassigned-categories-section">
        <h3>未分類の中項目カテゴリ（ドラッグして象限に割り当ててください）</h3>
        <div className="unassigned-categories-list">
          {Object.keys(groupedUnassignedCategories).length > 0 ? (
            Object.entries(groupedUnassignedCategories).map(([mainCategory, subCategories]) => (
              <div key={`unassigned-group-${mainCategory}`} className="unassigned-category-group">
                <h4 className="unassigned-main-category-header">{mainCategory}</h4>
                <div className="unassigned-subcategory-list">
                  {subCategories.map(subCategory => {
                    const categoryKey = `${mainCategory} - ${subCategory}`;
                    return (
                      <div key={`unassigned-${categoryKey}`} className={`unassigned-category-item ${draggedCategory === categoryKey ? 'dragging' : ''}`} draggable onDragStart={(e) => handleDragStart(e, categoryKey)} onDragEnd={handleDragEnd}>{subCategory}</div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="no-categories-message">未分類の中項目カテゴリはありません</p>
          )}
        </div>
      </div>
      
      {/* メインの四分法表示（ドラッグアンドドロップ可能） */}
      {totalCategories > 0 && ( // totalCategories を使用
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

export default CategoryQuadrantView;