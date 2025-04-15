/**
 * カテゴリ集計に関する共通ユーティリティ関数
 */

/**
 * データをカテゴリで集計し、カテゴリ別の合計金額を計算する汎用関数
 * 
 * @param {Array} data - 集計するデータの配列
 * @param {Object} options - オプション設定
 * @param {string} options.categoryKey - カテゴリキー (デフォルト: '大項目')
 * @param {string|null} options.subCategoryKey - サブカテゴリキー (デフォルト: null、指定しない場合はサブカテゴリ無し)
 * @param {string} options.amountKey - 金額キー (デフォルト: '金額（円）')
 * @param {string} options.defaultCategory - カテゴリが存在しない場合のデフォルト値 (デフォルト: '未分類')
 * @param {string} options.defaultSubCategory - サブカテゴリが存在しない場合のデフォルト値 (デフォルト: '未分類')
 * @param {boolean} options.includeZero - 金額が0のカテゴリも結果に含めるか (デフォルト: false)
 * @param {boolean} options.absolute - 金額の絶対値を使用するか (デフォルト: false)
 * @returns {Object} カテゴリごとの集計結果オブジェクト
 */
export const aggregateByCategory = (data, options = {}) => {
  // オプションの初期値設定
  const {
    categoryKey = '大項目',
    subCategoryKey = null,
    amountKey = '金額（円）',
    defaultCategory = '未分類',
    defaultSubCategory = '未分類',
    includeZero = false,
    absolute = false
  } = options;

  // 入力チェック
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {};
  }

  // カテゴリごとの集計オブジェクト
  const totals = {};

  // データを走査して集計
  data.forEach(item => {
    // カテゴリ名の取得（未設定の場合はデフォルト値）
    const category = item[categoryKey] || defaultCategory;
    
    // 金額の数値変換（文字列や無効な値の処理）
    let amount = 0;
    try {
      if (typeof item[amountKey] === 'number') {
        amount = item[amountKey];
      } else if (typeof item[amountKey] === 'string') {
        // 通貨記号やカンマを除去して数値化
        amount = parseFloat(item[amountKey].replace(/[^\d.-]/g, '')) || 0;
      }
    } catch (error) {
      console.warn(`金額の変換エラー: ${error.message}`);
    }
    
    // 絶対値が必要な場合は計算
    if (absolute) {
      amount = Math.abs(amount);
    }

    // カテゴリキーの作成（サブカテゴリあり/なしで分岐）
    let categoryFullKey; // 変数名をcategoryFullKeyに変更
    if (subCategoryKey) {
      // サブカテゴリの取得（未設定の場合はデフォルト値）
      const subCategory = item[subCategoryKey] || defaultSubCategory;
      categoryFullKey = `${category} - ${subCategory}`;
    } else {
      categoryFullKey = category;
    }

    // カテゴリごとの集計に加算
    totals[categoryFullKey] = (totals[categoryFullKey] || 0) + amount;
  });

  // ゼロ値を除外するかどうか
  if (!includeZero) {
    Object.keys(totals).forEach(key => {
      if (totals[key] === 0) {
        delete totals[key];
      }
    });
  }

  return totals;
};

/**
 * カテゴリ集計結果を金額の降順でソート
 * 
 * @param {Object} aggregatedData - aggregateByCategory関数の結果オブジェクト
 * @param {number} limit - 返す結果の最大数 (デフォルト: 0 = 制限なし)
 * @param {boolean} filterPositive - 正の金額のみフィルタするか (デフォルト: false)
 * @returns {Array} [カテゴリ名, 金額] の配列のソート済み配列
 */
export const sortCategoryTotals = (aggregatedData, limit = 0, filterPositive = false) => {
  // 入力チェック
  if (!aggregatedData || typeof aggregatedData !== 'object') {
    return [];
  }

  // オブジェクトを配列に変換
  let entries = Object.entries(aggregatedData);

  // 正の金額のみにフィルタ（必要な場合）
  if (filterPositive) {
    entries = entries.filter(([_, amount]) => amount > 0);
  }

  // 金額の降順でソート
  entries.sort(([, a], [, b]) => b - a);

  // 制限がある場合は上位N個を返す
  if (limit > 0) {
    entries = entries.slice(0, limit);
  }

  return entries;
};

/**
 * カテゴリ集計結果をChart.js用の形式に変換
 * 
 * @param {Object} aggregatedData - aggregateByCategory関数の結果オブジェクト
 * @param {Object} options - オプション設定
 * @param {number} options.limit - 表示するカテゴリの最大数 (デフォルト: 0 = 制限なし)
 * @param {boolean} options.filterPositive - 正の金額のみ表示 (デフォルト: true)
 * @param {function} options.colorGenerator - 色を生成する関数 (デフォルト: generateColorPalette)
 * @returns {Object} Chart.js形式のデータオブジェクト
 */
export const convertToChartData = (aggregatedData, options = {}) => {
  // デフォルト値の設定
  const { 
    limit = 0, 
    filterPositive = true,
    colorGenerator = null
  } = options;

  // 集計データが無効な場合は空のチャートデータを返す
  if (!aggregatedData || Object.keys(aggregatedData).length === 0) {
    return {
      labels: ['データなし'],
      datasets: [{
        data: [1],
        backgroundColor: ['#cccccc']
      }]
    };
  }

  // カテゴリをソート
  const sortedCategories = sortCategoryTotals(aggregatedData, limit, filterPositive);

  // カラー生成関数の参照
  let generateColors;
  try {
    if (colorGenerator && typeof colorGenerator === 'function') {
      generateColors = colorGenerator;
    } else {
      // デフォルトのカラーリスト
      const defaultColors = [
        '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
        '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
        '#2C7BE5', '#27AE60', '#9B59B6', '#F1C40F', '#E74C3C'
      ];

      generateColors = (count) => {
        if (count <= defaultColors.length) {
          return defaultColors.slice(0, count);
        }
        // 色が足りない場合は循環する
        return Array(count).fill()
          .map((_, i) => defaultColors[i % defaultColors.length]);
      };
    }
  } catch (error) {
    console.error('色生成関数のロード時にエラーが発生しました:', error);
    // エラー時のフォールバック
    generateColors = (count) => Array(count).fill('#cccccc');
  }

  // カラーを生成
  const colors = generateColors(sortedCategories.length);

  // Chart.js用のデータ形式に変換
  return {
    labels: sortedCategories.map(item => item[0]),
    datasets: [{
      data: sortedCategories.map(item => item[1]),
      backgroundColor: colors,
      borderWidth: 1
    }]
  };
};

/**
 * 月次推移データを集計・変換する
 * 
 * @param {Array} data - 集計するデータの配列
 * @param {Object} options - オプション設定
 * @param {string} options.dateKey - 日付キー（デフォルト: '日付'）
 * @param {string} options.categoryKey - カテゴリキー（デフォルト: '大項目'）
 * @param {string} options.amountKey - 金額キー（デフォルト: '金額（円）'）
 * @param {number} options.maxCategories - 表示するカテゴリの最大数（デフォルト: 5）
 * @param {function} options.normalizeDate - 日付を年月形式に正規化する関数
 * @param {function} options.colorGenerator - 色を生成する関数
 * @param {function} options.compareMonths - 月をソートする比較関数
 * @returns {Object} Chart.js折れ線グラフ用のデータ形式
 */
export const aggregateMonthlyData = (data, options = {}) => {
  // オプション設定のデフォルト値
  const {
    dateKey = '日付',
    categoryKey = '大項目',
    amountKey = '金額（円）',
    maxCategories = 5,
    normalizeDate,
    colorGenerator,
    compareMonths
  } = options;
  
  // 入力チェック
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { labels: [], datasets: [] };
  }

  // 日付キーが存在するかチェック
  const hasValidDateKey = data.some(item => item[dateKey] !== undefined);
  if (!hasValidDateKey) {
    return { labels: [], datasets: [] };
  }
  
  // 月別・カテゴリ別に集計データを格納するオブジェクト
  const monthlyData = {};   // 月別データ格納用
  const categories = new Set();  // ユニークなカテゴリを収集
  
  // normalizeDate関数を取得または定義
  const normalizeDateFn = normalizeDate || ((dateValue) => {
    try {
      if (dateValue instanceof Date) {
        return `${dateValue.getFullYear()}年${dateValue.getMonth() + 1}月`;
      }
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return `${date.getFullYear()}年${date.getMonth() + 1}月`;
        }
        // YYYY/MM/DD形式の処理
        const match = dateValue.match(/(\d{4})[/-](\d{1,2})[/-]\d{1,2}/);
        if (match) {
          return `${match[1]}年${match[2]}月`;
        }
      }
      return '日付不明';
    } catch (error) {
      return '日付不明';
    }
  });

  // compareMonths関数を取得または定義
  const compareMonthsFn = compareMonths || ((a, b) => {
    if (a === '日付不明') return 1;
    if (b === '日付不明') return -1;
    
    const yearMonthA = a.match(/(\d+)年(\d+)月/);
    const yearMonthB = b.match(/(\d+)年(\d+)月/);
    
    if (!yearMonthA || !yearMonthB) return 0;
    
    const yearA = parseInt(yearMonthA[1], 10);
    const yearB = parseInt(yearMonthB[1], 10);
    
    if (yearA !== yearB) return yearA - yearB;
    
    const monthA = parseInt(yearMonthA[2], 10);
    const monthB = parseInt(yearMonthB[2], 10);
    return monthA - monthB;
  });
  
  // 各データを処理して月次データに変換
  data.forEach(item => {
    // 日付を年月形式に正規化
    const monthKey = normalizeDateFn(item[dateKey]);
    
    // カテゴリを取得（未設定の場合は「未分類」）
    const category = item[categoryKey] || '未分類';
    categories.add(category);
    
    // 金額を数値に変換
    let amount = 0;
    try {
      if (typeof item[amountKey] === 'number') {
        amount = item[amountKey];
      } else if (item[amountKey]) {
        amount = parseFloat(String(item[amountKey]).replace(/[^\d.-]/g, '')) || 0;
      }
    } catch (error) {
      console.warn('金額変換エラー:', error);
    }
    
    // 月別・カテゴリ別のマップを更新
    if (monthKey !== '日付不明') {
      // その月のエントリがなければ初期化
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }
      
      // カテゴリの金額を加算
      monthlyData[monthKey][category] = (monthlyData[monthKey][category] || 0) + amount;
    }
  });
  
  // 有効なデータがあるかチェック
  const validMonths = Object.keys(monthlyData);
  if (validMonths.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  // 月を時系列順にソート
  const sortedMonths = validMonths.sort(compareMonthsFn);
  
  // カテゴリごとの合計金額を計算
  const categoryTotals = {};
  
  sortedMonths.forEach(month => {
    Object.entries(monthlyData[month]).forEach(([category, amount]) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(amount);
    });
  });
  
  // 合計金額の降順でカテゴリをソート、上位N個を選択
  const topCategories = Object.keys(categoryTotals)
    .filter(category => categoryTotals[category] > 0)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a])
    .slice(0, maxCategories);
  
  if (topCategories.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  // チャートカラーを生成
  const generateColorsFn = colorGenerator || ((count) => {
    // デフォルトカラーパレット
    const defaultColors = [
      '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
      '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
    ];
    
    if (count <= defaultColors.length) {
      return defaultColors.slice(0, count);
    }
    
    return Array(count).fill().map((_, i) => defaultColors[i % defaultColors.length]);
  });
  
  const colors = generateColorsFn(topCategories.length);
  
  // Chart.js用のデータセットを作成
  const datasets = topCategories.map((category, index) => {
    // 月ごとの金額データを収集
    const data = sortedMonths.map(month => {
      return monthlyData[month][category] || 0;
    });
    
    // データセット定義を作成
    return {
      label: category,
      data: data,
      borderColor: colors[index],
      backgroundColor: `${colors[index]}33`, // 透明度33%
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6
    };
  });
  
  // 結果を返す
  return {
    labels: sortedMonths,
    datasets: datasets
  };
};

// デフォルトエクスポート
export default {
  aggregateByCategory,
  sortCategoryTotals,
  convertToChartData,
  aggregateMonthlyData
};