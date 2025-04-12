/**
 * データを正の値と負の値に分割してチャートデータを生成する
 * @param {Array} data - 元データ配列
 * @param {string} categoryKey - カテゴリキー（デフォルト: '大項目'）
 * @param {string} amountKey - 金額キー（デフォルト: '金額（円）'）
 * @returns {Object} 正と負のチャートデータ
 */
export const splitDataBySign = (data, categoryKey = '大項目', amountKey = '金額（円）') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      positiveData: createEmptyChartData(),
      negativeData: createEmptyChartData(),
      positiveTotal: 0,
      negativeTotal: 0
    };
  }

  try {
    const positiveData = data.filter(item => Number(item[amountKey]) > 0);
    const negativeData = data.filter(item => Number(item[amountKey]) < 0);

    const positiveTotal = positiveData.reduce((acc, item) => acc + Number(item[amountKey]), 0);
    const negativeTotal = negativeData.reduce((acc, item) => acc + Number(item[amountKey]), 0);

    return {
      positiveData: aggregateDataByCategory(positiveData, categoryKey, amountKey),
      negativeData: aggregateDataByCategory(negativeData, categoryKey, amountKey),
      positiveTotal,
      negativeTotal
    };
  } catch (error) {
    console.error('Error in splitDataBySign:', error);
    return {
      positiveData: createEmptyChartData(),
      negativeData: createEmptyChartData(),
      positiveTotal: 0,
      negativeTotal: 0
    };
  }
};

/**
 * カテゴリごとにデータを集計してチャートデータに変換する
 * @param {Array} data - 集計対象のデータ配列
 * @param {string} categoryKey - カテゴリキー（デフォルト: '大項目'）
 * @param {string} amountKey - 金額キー（デフォルト: '金額（円）'）
 * @returns {Object} Chart.js形式のデータオブジェクト
 */
export const aggregateDataByCategory = (data, categoryKey = '大項目', amountKey = '金額（円）') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return createEmptyChartData();
  }

  try {
    // カテゴリごとに合計を計算
    const categoryTotals = data.reduce((acc, item) => {
      const category = item[categoryKey] || '未分類';
      const amount = Number(item[amountKey]) || 0;
      
      if (acc[category]) {
        acc[category] += amount;
      } else {
        acc[category] = amount;
      }
      
      return acc;
    }, {});

    // Chart.js形式のデータに変換
    const chartColors = getChartColors(Object.keys(categoryTotals).length);
    
    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: chartColors,
        hoverBackgroundColor: chartColors
      }]
    };
  } catch (error) {
    console.error('Error in aggregateDataByCategory:', error);
    return createEmptyChartData();
  }
};

/**
 * 空のチャートデータオブジェクトを作成する
 * @returns {Object} 空のChart.js形式データオブジェクト
 */
export const createEmptyChartData = () => {
  return {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  };
};

/**
 * チャート用のカラーパレットを生成する
 * @param {number} count - 必要な色の数
 * @returns {Array} 色のコード配列
 */
export const getChartColors = (count) => {
  // 基本カラーパレット
  const baseColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC249', '#EA526F', '#49ADA3', '#F4BFDB'
  ];
  
  // 必要な数だけ繰り返し
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};
