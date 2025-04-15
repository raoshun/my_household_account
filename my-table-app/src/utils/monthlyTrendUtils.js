/**
 * 月次推移データ処理のための専用ユーティリティ関数
 */

/**
 * 日付文字列を「YYYY年MM月」形式に変換する
 * 様々な日付形式に対応
 * 
 * @param {string|Date} dateValue - 変換する日付
 * @returns {string} - 変換された日付文字列、または「日付不明」
 */
export const formatToYearMonth = (dateValue) => {
  try {
    if (!dateValue) return '日付不明';

    // 既にDate型の場合
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return `${dateValue.getFullYear()}年${dateValue.getMonth() + 1}月`;
    }

    // 文字列の場合
    if (typeof dateValue === 'string') {
      // YYYY/MM/DD または YYYY-MM-DD 形式
      const standardFormat = dateValue.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
      if (standardFormat) {
        const year = parseInt(standardFormat[1], 10);
        const month = parseInt(standardFormat[2], 10);
        return `${year}年${month}月`;
      }

      // YYYY年MM月DD日 形式
      const jpFormat = dateValue.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日?$/);
      if (jpFormat) {
        const year = parseInt(jpFormat[1], 10);
        const month = parseInt(jpFormat[2], 10);
        return `${year}年${month}月`;
      }

      // MM/DD/YYYY 形式 (米国式)
      const usFormat = dateValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (usFormat) {
        const month = parseInt(usFormat[1], 10);
        const year = parseInt(usFormat[3], 10);
        return `${year}年${month}月`;
      }

      // その他はDate型に変換を試みる
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return `${date.getFullYear()}年${date.getMonth() + 1}月`;
      }
    }

    return '日付不明';
  } catch (error) {
    console.error('日付変換エラー:', error, dateValue);
    return '日付不明';
  }
};

/**
 * 月を時系列順にソートするための比較関数
 * 
 * @param {string} a - 比較する最初の月（例: '2023年1月'）
 * @param {string} b - 比較する2番目の月（例: '2023年2月'）
 * @returns {number} - ソート順（負: a < b, 0: a = b, 正: a > b）
 */
export const sortMonthsChronologically = (a, b) => {
  // 「日付不明」は最後に
  if (a === '日付不明') return 1;
  if (b === '日付不明') return -1;
  
  // 年月をパース
  const yearMonthA = a.match(/(\d+)年(\d+)月/);
  const yearMonthB = b.match(/(\d+)年(\d+)月/);
  
  if (!yearMonthA || !yearMonthB) return 0;
  
  // 年で比較
  const yearA = parseInt(yearMonthA[1], 10);
  const yearB = parseInt(yearMonthB[1], 10);
  
  if (yearA !== yearB) return yearA - yearB;
  
  // 月で比較
  const monthA = parseInt(yearMonthA[2], 10);
  const monthB = parseInt(yearMonthB[2], 10);
  return monthA - monthB;
};

/**
 * 数値に変換する（文字列、通貨記号、カンマなどを処理）
 * 
 * @param {any} value - 変換する値
 * @returns {number} - 変換された数値、変換できない場合は0
 */
export const parseNumberValue = (value) => {
  if (value === null || value === undefined) return 0;
  
  // 既に数値の場合はそのまま返す
  if (typeof value === 'number') return value;
  
  try {
    // 文字列の場合、通貨記号やカンマを削除して変換
    if (typeof value === 'string') {
      // 通貨記号（¥, $など）とカンマを削除
      const cleanedValue = value.replace(/[^\d.-]/g, '');
      const result = parseFloat(cleanedValue);
      return isNaN(result) ? 0 : result;
    }
    
    return 0;
  } catch (error) {
    console.warn('数値変換エラー:', error);
    return 0;
  }
};

/**
 * カラーパレットを生成する
 * 
 * @param {number} count - 必要な色の数
 * @returns {string[]} - 色コードの配列
 */
export const generateColors = (count) => {
  // デフォルトカラーパレット
  const defaultColors = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
    '#2C7BE5', '#27AE60', '#9B59B6', '#F1C40F', '#E74C3C'
  ];
  
  // 色の数が足りない場合は繰り返し使用
  return Array.from({ length: count }, (_, i) => 
    defaultColors[i % defaultColors.length]
  );
};

/**
 * データから月次推移チャート用のデータを生成する
 * 
 * @param {Array} data - 家計簿データの配列
 * @param {Object} options - オプション設定
 * @param {string} options.dateKey - 日付が格納されているキー (デフォルト: '日付')
 * @param {string} options.categoryKey - カテゴリが格納されているキー (デフォルト: '大項目')
 * @param {string} options.amountKey - 金額が格納されているキー (デフォルト: '金額（円）')
 * @param {number} options.maxCategories - 表示するカテゴリの最大数 (デフォルト: 5)
 * @param {boolean} options.debug - デバッグモードを有効にするかどうか (デフォルト: false)
 * @returns {Object} Chart.js折れ線グラフ用のデータ
 */
export const createMonthlyTrendData = (data, options = {}) => {
  // デフォルトオプション
  const {
    dateKey = '日付',
    categoryKey = '大項目',
    amountKey = '金額（円）',
    maxCategories = 5,
    debug = false
  } = options;

  if (debug) {
    console.log('月次推移データ作成開始 - データ件数:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('サンプルデータ:', data[0]);
    }
  }

  // データが無効な場合は空のデータを返す
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('月次推移データを作成できません: データがありません');
    return { labels: [], datasets: [] };
  }

  try {
    // 月別・カテゴリ別に金額を集計
    const monthlyData = {};  // { '2023年1月': { '食費': 10000, '住居費': 50000, ... } }
    const categorySet = new Set();  // カテゴリ一覧
    let validDataCount = 0;
    let invalidDateCount = 0;

    // データを月ごと・カテゴリごとに集計
    data.forEach(item => {
      // 日付を「YYYY年MM月」形式に変換
      const month = formatToYearMonth(item[dateKey]);
      
      // カテゴリを取得（未設定は「未分類」に）
      const category = item[categoryKey] || '未分類';
      categorySet.add(category);
      
      // 金額を数値に変換
      const amount = parseNumberValue(item[amountKey]);
      
      // 月別データの初期化
      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }
      
      // 月別・カテゴリ別に加算
      monthlyData[month][category] = (monthlyData[month][category] || 0) + amount;
      
      if (month === '日付不明') {
        invalidDateCount++;
      } else {
        validDataCount++;
      }
    });

    // デバッグ情報
    if (debug) {
      console.log('月次推移: 有効なデータ件数:', validDataCount);
      console.log('月次推移: 無効な日付のデータ件数:', invalidDateCount);
      console.log('月次推移: カテゴリの数:', categorySet.size);
      console.log('月次推移: 月の数:', Object.keys(monthlyData).length);
    }

    // 月が一つも取得できなかった場合
    if (Object.keys(monthlyData).length === 0) {
      return { labels: [], datasets: [] };
    }

    // カテゴリごとの合計金額を計算
    const categoryTotals = {};
    Object.values(monthlyData).forEach(monthData => {
      Object.entries(monthData).forEach(([category, amount]) => {
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(amount);
      });
    });

    // カテゴリを合計金額降順でソート
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCategories)
      .map(([category]) => category);

    if (debug) {
      console.log('月次推移: 選択されたトップカテゴリ:', sortedCategories);
    }

    // 月を時系列順にソート
    const sortedMonths = Object.keys(monthlyData)
      .filter(month => month !== '日付不明')  // 「日付不明」を除外
      .sort(sortMonthsChronologically);

    // 「日付不明」があれば末尾に追加
    if (monthlyData['日付不明']) {
      sortedMonths.push('日付不明');
    }

    if (debug) {
      console.log('月次推移: ソート済み月次データ:', sortedMonths);
    }

    // カラーを生成
    const colors = generateColors(sortedCategories.length);

    // データセットを作成
    const datasets = sortedCategories.map((category, index) => {
      // 月ごとの金額データを取得
      const monthlyValues = sortedMonths.map(month => {
        return monthlyData[month][category] || 0;
      });

      // データセット
      return {
        label: category,
        data: monthlyValues,
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',  // 20% 透明度
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

  } catch (error) {
    console.error('月次推移データの生成中にエラーが発生しました:', error);
    return { labels: [], datasets: [] };
  }
};

/**
 * Chart.jsのオプションを作成する
 */
export const getDefaultTrendChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          boxWidth: 10,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        titleFont: { weight: 'bold' },
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ¥${value.toLocaleString()}`;
          }
        }
      },
      title: {
        display: true,
        text: '月次推移チャート',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '月'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        title: {
          display: true,
          text: '金額 (円)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '¥' + value.toLocaleString();
          }
        }
      }
    },
    animation: {
      duration: 800
    }
  };
};

export default {
  formatToYearMonth,
  sortMonthsChronologically,
  parseNumberValue,
  generateColors,
  createMonthlyTrendData,
  getDefaultTrendChartOptions
};