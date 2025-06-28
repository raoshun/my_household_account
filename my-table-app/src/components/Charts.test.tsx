/* eslint-env jest */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Charts from './Charts';

// テスト用データ
const mockPositiveChartData = {
  labels: ['食費', '交通費', '娯楽'],
  datasets: [{
    data: [3000, 1000, 2000],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
  }]
};

const mockNegativeChartData = {
  labels: ['給料', '賞与'],
  datasets: [{
    data: [30000, 5000],
    backgroundColor: ['#4BC0C0', '#9966FF'],
    hoverBackgroundColor: ['#4BC0C0', '#9966FF']
  }]
};

// Chart.jsの代わりにモックを使用
jest.mock('chart.js', () => {
  // モックChart関数とその実装
  const mockChart = function() {
    return {
      destroy: function() {},
      update: function() {},
      data: { labels: [], datasets: [] }
    };
  };
  
  // registerメソッドを追加
  mockChart.register = function() {};
  
  return {
    Chart: mockChart,
    ArcElement: function() {},
    PieController: function() {},
    Tooltip: function() {},
    Legend: function() {}
  };
});

// window拡張: テスト用プロパティを型安全に追加

describe('Charts Component', () => {
  // テスト用のモック関数
  const mockOnClick = jest.fn();
  const mockOnHover = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    // windowをanyとして拡張プロパティを安全に削除
    delete (window as any).__JEST_TEST_ENV__;
  });
  
  test('renders chart components with proper data', () => {
    render(
      <Charts
        positiveChartData={mockPositiveChartData}
        negativeChartData={mockNegativeChartData}
        positiveTotal={6000}
        negativeTotal={35000}
        options={{}}
        onHover={mockOnHover}
        onClick={mockOnClick}
      />
    );
    
    // 収入と支出のセクション見出しが正しく表示されていることを確認
    const incomeHeading = screen.getByText(/収入:/);
    const expenseHeading = screen.getByText(/支出:/);
    expect(incomeHeading).toBeInTheDocument();
    expect(expenseHeading).toBeInTheDocument();
    
    // 金額が正しく表示されていることを確認
    // 正規表現を使用して分割されたテキストにも対応
    expect(screen.getByText(/6,000/)).toBeInTheDocument();
    expect(screen.getByText(/35,000/)).toBeInTheDocument();
    
    // チャートのキャンバス要素または代替のテスト用モック要素が存在することを確認
    const positiveChart = screen.getByTestId('mock-positive-chart') || screen.getByTestId('positive-chart');
    const negativeChart = screen.getByTestId('mock-negative-chart') || screen.getByTestId('negative-chart');
    expect(positiveChart).toBeInTheDocument();
    expect(negativeChart).toBeInTheDocument();
  });

  test('should have displayName set to "Charts"', () => {
    expect(Charts.displayName).toBe('Charts');
  });

  test('renders mock UI when test environment flag is enabled', () => {
    // テストフラグをセット
    window.__JEST_TEST_ENV__ = true;
    render(<Charts />);
    // mock-charts が描画されること
    const mockContainer = screen.getByTestId('mock-charts');
    expect(mockContainer).toBeInTheDocument();
    // data-charts-key 属性が存在すること
    expect(mockContainer).toHaveAttribute('data-charts-key');
  });
});