/* eslint-disable */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// @testing-library/jest-dom の型定義を明示的に宣言
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

// モック関数の事前定義
const mockUpdateFn = jest.fn();
const mockDestroyFn = jest.fn();

// チャートインスタンスの事前定義
const mockChartInstance = {
  update: mockUpdateFn,
  destroy: mockDestroyFn,
  data: { 
    datasets: [{ 
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] 
    }] 
  }
};

// Chart.jsのクラスとメソッドをモック化
function MockChart() {
  return mockChartInstance;
}
MockChart.register = function() {};

// Chart.jsモジュールをモック化
jest.mock('chart.js', () => {
  return {
    Chart: MockChart,
    ArcElement: function() {},
    PieController: function() {},
    Tooltip: function() {},
    Legend: function() {}
  };
});

// モックチャートデータを作成
const mockChartData = {
  labels: ['食費', '交通費', '娯楽'],
  datasets: [{
    label: '支出',
    data: [3000, 1000, 2000],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
  }]
};

// テスト対象コンポーネントをインポート
import ChartHighlight from './ChartHighlight';

describe('ChartHighlight', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    // モックインスタンスのすべての関数をリセット
    mockUpdateFn.mockClear();
    mockDestroyFn.mockClear();
  });
  
  test('コンポーネントが正しくレンダリングされる', () => {
    // コンポーネントをレンダリング
    render(
      <ChartHighlight 
        chartData={mockChartData}
      />
    );
    
    // 要素が正しくレンダリングされたことを確認
    const chartElement = screen.getByTestId('chart-highlight');
    expect(chartElement).toBeTruthy();
    
    // テストモードでの表示内容を確認
    expect(screen.getByText('食費: 3000')).toBeTruthy();
    expect(screen.getByText('交通費: 1000')).toBeTruthy();
    expect(screen.getByText('娯楽: 2000')).toBeTruthy();
  });
  
  test('chartDataが更新されるとコンポーネントが再レンダリングされる', () => {
    // コンポーネントをレンダリング
    const { rerender } = render(
      <ChartHighlight 
        chartData={mockChartData}
      />
    );
    
    // 最初の状態を確認
    expect(screen.getByText('食費: 3000')).toBeTruthy();
    
    // 異なるデータでコンポーネントを再レンダリング
    const updatedChartData = {
      ...mockChartData,
      datasets: [{
        ...mockChartData.datasets[0],
        data: [3500, 1200, 2200]
      }]
    };
    
    rerender(
      <ChartHighlight 
        chartData={updatedChartData}
      />
    );
    
    // 更新されたデータが表示されることを確認
    expect(screen.getByText('食費: 3500')).toBeTruthy();
    expect(screen.getByText('交通費: 1200')).toBeTruthy();
    expect(screen.getByText('娯楽: 2200')).toBeTruthy();
  });
  
  test('ラベルが追加されると新しいアイテムが表示される', () => {
    // コンポーネントをレンダリング
    const { rerender } = render(
      <ChartHighlight 
        chartData={mockChartData}
      />
    );
    
    // 異なるデータでコンポーネントを再レンダリング
    const updatedChartData = {
      ...mockChartData,
      labels: ['食費', '交通費', '娯楽', '住居費'],
      datasets: [{
        ...mockChartData.datasets[0],
        data: [3000, 1000, 2000, 5000],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }]
    };
    
    rerender(
      <ChartHighlight 
        chartData={updatedChartData}
      />
    );
    
    // 新しいアイテムが表示されることを確認
    expect(screen.getByText('住居費: 5000')).toBeTruthy();
  });
});
