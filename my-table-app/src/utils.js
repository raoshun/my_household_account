import { prepareChartData as originalPrepareChartData, splitDataBySign as originalSplitDataBySign, calculateTotal } from './utils/chartDataUtils';

// 元のファイルからエクスポートされていた関数を再エクスポート
export { prepareChartData } from './utils/chartDataUtils';

/**
 * データを収入と支出に分割する
 * テスト互換性のためのラッパー関数
 * @param {Array} data - 処理対象のデータ配列
 * @param {string} amountKey - 金額が格納されているプロパティ名（デフォルト: '金額（円）'）
 * @returns {Object} - テスト互換形式の分割データ
 */
export const splitDataBySign = (data, amountKey = '金額（円）') => {
  // 元の関数を呼び出す
  const result = originalSplitDataBySign(data, amountKey);
  
  // 正の金額と負の金額それぞれの合計を計算
  const positiveTotal = calculateTotal(result.positive, amountKey);
  const negativeTotal = -1 * calculateTotal(result.negative, amountKey); // 負の値に変換
  
  // 正の金額のデータをChart.js形式に変換
  const positiveData = originalPrepareChartData(result.positive, '大項目', amountKey);
  
  // 負の金額のデータをChart.js形式に変換
  const negativeData = originalPrepareChartData(result.negative, '大項目', amountKey);
  
  // テスト互換形式のオブジェクトを返す
  return {
    positive: result.positive,
    negative: result.negative,
    positiveTotal,
    negativeTotal,
    positiveData,
    negativeData
  };
};

/**
 * カテゴリごとのデータを集計する
 * テスト互換性のための関数
 * @param {Array} data - 集計対象のデータ配列
 * @param {string} categoryKey - カテゴリキー（デフォルト: '大項目'）
 * @param {string} amountKey - 金額キー（デフォルト: '金額（円）'）
 * @returns {Object} - テスト互換形式のチャートデータ
 */
export const aggregateDataByCategory = (data, categoryKey = '大項目', amountKey = '金額（円）') => {
  // prepareChartDataを利用して集計
  const result = originalPrepareChartData(data, categoryKey, amountKey);
  
  // テスト互換形式に変換して返す
  return {
    labels: result.labels,
    datasets: [{
      data: result.datasets[0].data,
      backgroundColor: result.datasets[0].backgroundColor || [],
      hoverBackgroundColor: result.datasets[0].backgroundColor || [] // 元の背景色と同じに
    }]
  };
};

// テスト関数のみこのファイルに残す
export const testAggregateDataByCategory = () => {
    const testData = [
        { '大項目': '食費', '金額（円）': 1000 },
        { '大項目': '交通費', '金額（円）': 500 },
        { '大項目': '食費', '金額（円）': 1500 },
        { '大項目': '娯楽', '金額（円）': 2000 },
        { '大項目': '交通費', '金額（円）': 700 },
    ];

    // prepareChartData関数を使用するように更新
    const result = originalPrepareChartData(testData);
    console.log('Test Result:', result);
    
    // 合計値の確認
    const expectedTotals = {
        '食費': 2500,
        '交通費': 1200,
        '娯楽': 2000
    };
    
    const actualLabels = result.labels;
    const actualData = result.datasets[0].data;
    
    // 結果の検証
    console.assert(
        actualLabels.every(label => expectedTotals[label] !== undefined) &&
        actualLabels.length === Object.keys(expectedTotals).length &&
        actualData.every((value, i) => value === expectedTotals[actualLabels[i]]),
        'Test failed'
    );
    
    console.log('Test passed');
};
