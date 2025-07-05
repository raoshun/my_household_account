import { createTrendData } from './monthlyTrendUtils';

describe('createTrendData', () => {
  const sampleData = [
    { '日付': '2023/01/02', '大項目': '食費', '金額（円）': 1000 },
    { '日付': '2023/01/03', '大項目': '食費', '金額（円）': 2000 },
    { '日付': '2023/01/10', '大項目': '交通費', '金額（円）': 500 },
    { '日付': '2023/01/12', '大項目': '食費', '金額（円）': 1500 },
    { '日付': '2023/01/15', '大項目': '交通費', '金額（円）': 800 },
    { '日付': '2023/01/20', '大項目': '食費', '金額（円）': 1200 },
    { '日付': '2023/01/25', '大項目': '娯楽', '金額（円）': 3000 },
    { '日付': '2023/02/01', '大項目': '食費', '金額（円）': 1100 },
    { '日付': '2023/02/05', '大項目': '交通費', '金額（円）': 700 },
    { '日付': '2023/02/10', '大項目': '娯楽', '金額（円）': 2000 }
  ];

  it('集計単位: 月次で正しく集計される', () => {
    const result = createTrendData(sampleData, { unit: 'monthly', dateKey: '日付', categoryKey: '大項目', amountKey: '金額（円）' });
    expect(result.labels.some(l => l.includes('2023年1月'))).toBe(true);
    expect(result.labels.some(l => l.includes('2023年2月'))).toBe(true);
    expect(result.datasets.length).toBeGreaterThan(0);
  });

  it('集計単位: 週次で正しく集計される', () => {
    const result = createTrendData(sampleData, { unit: 'weekly', dateKey: '日付', categoryKey: '大項目', amountKey: '金額（円）' });
    expect(result.labels.some(l => l.match(/2023年第\d+週/))).toBe(true);
    expect(result.datasets.length).toBeGreaterThan(0);
    // 週番号が重複しないこと
    const uniqueWeeks = new Set(result.labels);
    expect(uniqueWeeks.size).toBe(result.labels.length);
  });

  it('不正な日付データも処理できる', () => {
    const data = [
      { '日付': 'invalid-date', '大項目': '食費', '金額（円）': 1000 },
      { '日付': '2023/01/02', '大項目': '食費', '金額（円）': 2000 }
    ];
    const result = createTrendData(data, { unit: 'weekly', dateKey: '日付', categoryKey: '大項目', amountKey: '金額（円）' });
    expect(result.labels.includes('日付不明')).toBe(true);
  });
});
