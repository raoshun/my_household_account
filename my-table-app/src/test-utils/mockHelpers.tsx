// テスト用の共通モックデータ・セッター生成ヘルパー
export function createMockSetters() {
  return {
    setData: jest.fn(),
    setPositiveChartData: jest.fn(),
    setNegativeChartData: jest.fn(),
    setPositiveTotal: jest.fn(),
    setNegativeTotal: jest.fn(),
    setAggregatedData: jest.fn(),
    setCategoryTotals: jest.fn(),
    setIsLoading: jest.fn(),
    setError: jest.fn(),
    setMonthlyTrendData: jest.fn(),
    setDateRange: jest.fn()
  };
}

export function createMockCSVData() {
  return [
    { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
    { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
    { '大項目': '交通費', '中項目': '電車', '金額（円）': -500 }
  ];
}
