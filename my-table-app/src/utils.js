import { aggregateDataByCategory, splitDataBySign } from './utils/chartDataUtils';

// 元のファイルからエクスポートされていた関数を再エクスポート
export { aggregateDataByCategory, splitDataBySign };

// テスト関数のみこのファイルに残す
export const testAggregateDataByCategory = () => {
    const testData = [
        { '大項目': '食費', '金額（円）': 1000 },
        { '大項目': '交通費', '金額（円）': 500 },
        { '大項目': '食費', '金額（円）': 1500 },
        { '大項目': '娯楽', '金額（円）': 2000 },
        { '大項目': '交通費', '金額（円）': 700 },
    ];

    const result = aggregateDataByCategory(testData);
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
