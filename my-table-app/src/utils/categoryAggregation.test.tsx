/* eslint-env jest */
import { 
  aggregateByCategory, 
  sortCategoryTotals, 
  convertToChartData,
  aggregateMonthlyData 
} from './categoryAggregation';
import { describe, test, expect } from '@jest/globals';

describe('categoryAggregation', () => {
  // テスト用のサンプルデータ
  const sampleData = [
    { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
    { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
    { '大項目': '交通費', '中項目': '電車', '金額（円）': 500 },
    { '大項目': '交通費', '中項目': 'タクシー', '金額（円）': 1200 },
    { '大項目': '娯楽', '金額（円）': 3000 },
    { '金額（円）': 800 } // カテゴリなし
  ];

  describe('aggregateByCategory', () => {
    test('カテゴリキーのみで集計', () => {
      const result = aggregateByCategory(sampleData, {
        categoryKey: '大項目',
        amountKey: '金額（円）'
      });
      
      expect(result).toEqual({
        '食費': 3000,
        '交通費': 1700,
        '娯楽': 3000,
        '未分類': 800
      });
    });

    test('サブカテゴリを含めて集計', () => {
      const result = aggregateByCategory(sampleData, {
        categoryKey: '大項目',
        subCategoryKey: '中項目',
        amountKey: '金額（円）'
      });
      
      expect(result).toEqual({
        '食費 - 食料品': 1000,
        '食費 - 外食': 2000,
        '交通費 - 電車': 500,
        '交通費 - タクシー': 1200,
        '娯楽 - 未分類': 3000,
        '未分類 - 未分類': 800
      });
    });

    test('金額の絶対値で集計', () => {
      const negativeData = [
        { '大項目': '食費', '金額（円）': -1000 },
        { '大項目': '交通費', '金額（円）': -500 }
      ];
      
      const result = aggregateByCategory(negativeData, {
        categoryKey: '大項目',
        amountKey: '金額（円）',
        absolute: true
      });
      
      expect(result).toEqual({
        '食費': 1000,
        '交通費': 500
      });
    });

    test('空データの処理', () => {
      expect(aggregateByCategory(null)).toEqual({});
      expect(aggregateByCategory([])).toEqual({});
    });
  });

  describe('sortCategoryTotals', () => {
    const aggregatedData = {
      '食費': 3000,
      '交通費': 1700,
      '娯楽': 5000,
      '日用品': 800,
      '医療費': 2000
    };

    test('金額降順でソート', () => {
      const sorted = sortCategoryTotals(aggregatedData);
      expect(sorted).toEqual([
        ['娯楽', 5000],
        ['食費', 3000],
        ['医療費', 2000],
        ['交通費', 1700],
        ['日用品', 800]
      ]);
    });

    test('結果を指定個数に制限', () => {
      const sorted = sortCategoryTotals(aggregatedData, 3);
      expect(sorted).toHaveLength(3);
      expect(sorted[0][0]).toBe('娯楽');
      expect(sorted[1][0]).toBe('食費');
      expect(sorted[2][0]).toBe('医療費');
    });

    test('正の金額のみフィルタリング', () => {
      const dataWithNegative = {
        '食費': 3000,
        '給料': -10000,
        '交通費': 1700
      };
      
      const sorted = sortCategoryTotals(dataWithNegative, 0, true);
      expect(sorted).toHaveLength(2);
      expect(sorted.map(item => item[0])).toContain('食費');
      expect(sorted.map(item => item[0])).toContain('交通費');
      expect(sorted.map(item => item[0])).not.toContain('給料');
    });
  });

  describe('convertToChartData', () => {
    const aggregatedData = {
      '食費': 3000,
      '交通費': 1700,
      '娯楽': 5000
    };

    test('Chart.js形式に変換', () => {
      const result = convertToChartData(aggregatedData);
      
      // 基本構造を確認
      expect(result).toHaveProperty('labels');
      expect(result).toHaveProperty('datasets');
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0]).toHaveProperty('data');
      expect(result.datasets[0]).toHaveProperty('backgroundColor');
      
      // 内容を確認
      expect(result.labels).toContain('食費');
      expect(result.labels).toContain('交通費');
      expect(result.labels).toContain('娯楽');
      
      // データが正しいか確認
      expect(result.datasets[0].data).toContain(3000);
      expect(result.datasets[0].data).toContain(1700);
      expect(result.datasets[0].data).toContain(5000);
      
      // ラベルとデータの位置が対応しているか確認
      const foodIndex = result.labels.indexOf('食費');
      expect(result.datasets[0].data[foodIndex]).toBe(3000);
    });

    test('制限付きでChart.js形式に変換', () => {
      const result = convertToChartData(aggregatedData, { limit: 2 });
      
      // 制限が適用されているか確認
      expect(result.labels).toHaveLength(2);
      expect(result.datasets[0].data).toHaveLength(2);
      
      // 金額順でソートされているか確認
      expect(result.labels[0]).toBe('娯楽');
      expect(result.datasets[0].data[0]).toBe(5000);
    });

    test('空データの処理', () => {
      const result = convertToChartData({});
      
      expect(result.labels).toContain('データなし');
      expect(result.datasets[0].data).toContain(1);
    });
  });

  describe('aggregateMonthlyData', () => {
    const monthlyData = [
      { '日付': '2023/1/10', '大項目': '食費', '金額（円）': 1000 },
      { '日付': '2023/1/20', '大項目': '交通費', '金額（円）': 500 },
      { '日付': '2023/2/5', '大項目': '食費', '金額（円）': 1500 },
      { '日付': '2023/2/15', '大項目': '交通費', '金額（円）': 600 },
      { '日付': '2023/3/1', '大項目': '娯楽', '金額（円）': 2000 },
      { '日付': '2023/3/20', '大項目': '食費', '金額（円）': 1200 }
    ];

    test('月次データを正しく集計', () => {
      const result = aggregateMonthlyData(monthlyData);
      
      // 基本構造を確認
      expect(result).toHaveProperty('labels');
      expect(result).toHaveProperty('datasets');
      expect(result.datasets).toHaveLength(3); // 3つのカテゴリ
      
      // ラベルが月順でソートされているか確認
      expect(result.labels).toEqual(['2023年1月', '2023年2月', '2023年3月']);
      
      // 各カテゴリのデータセットが含まれているか確認
      const categoryNames = result.datasets.map(dataset => dataset.label);
      expect(categoryNames).toContain('食費');
      expect(categoryNames).toContain('交通費');
      expect(categoryNames).toContain('娯楽');
      
      // 各カテゴリの月別データが正しいか確認
      const foodDataset = result.datasets.find(dataset => dataset.label === '食費');
      expect(foodDataset.data).toEqual([1000, 1500, 1200]);
    });

    test('カテゴリ数の制限が適用される', () => {
      const result = aggregateMonthlyData(monthlyData, { maxCategories: 2 });
      
      // 上位2カテゴリのみ含まれているか確認
      expect(result.datasets).toHaveLength(2);
      
      // 金額合計が大きい順でソートされているか確認
      expect(result.datasets[0].label).toBe('食費'); // 3700円で最大
    });

    test('日付キーが存在しない場合は空結果', () => {
      const result = aggregateMonthlyData(monthlyData, { dateKey: '存在しないキー' });
      
      expect(result.labels).toEqual([]);
      expect(result.datasets).toEqual([]);
    });
  });
});