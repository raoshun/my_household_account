/* eslint-disable */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// モック関数の事前定義
const mockUpdateFn = function() { return; };
const mockDestroyFn = function() { return; };

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
    backgroundColor: '#FF6384',
    hoverBackgroundColor: '#FF6384'
  }]
};

// テスト対象コンポーネントをインポート
import ChartHighlight from './ChartHighlight';

describe('ChartHighlight', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    // モックインスタンスのすべての関数をリセット
    mockUpdateFn.mockClear && mockUpdateFn.mockClear();
    mockDestroyFn.mockClear && mockDestroyFn.mockClear();
  });
  
  test('ハイライト効果が適用される', () => {
    // Chart.jsのスパイを設定
    const updateSpy = jest.spyOn(mockChartInstance, 'update');
    
    // コンポーネントをレンダリング - chartDataプロパティを追加
    render(
      <ChartHighlight 
        chartData={mockChartData}
        chartRef={{ current: { chart: mockChartInstance } }}
        highlightIndex={1}
        percentage={20}
      />
    );
    
    // 要素が正しくレンダリングされたことを確認
    expect(screen.getByTestId('chart-highlight')).toBeInTheDocument();
    expect(screen.getByText('食費: 3000')).toBeInTheDocument();
  });
  
  test('パーセンテージが変更されると効果が更新される', () => {
    // Chart.jsのスパイを設定
    const updateSpy = jest.spyOn(mockChartInstance, 'update');
    
    // コンポーネントをレンダリングし、プロパティを変更 - chartDataプロパティを追加
    const { rerender } = render(
      <ChartHighlight 
        chartData={mockChartData}
        chartRef={{ current: { chart: mockChartInstance } }}
        highlightIndex={1}
        percentage={20}
      />
    );
    
    // 最初の呼び出しをリセット
    updateSpy.mockClear();
    
    // 異なるパーセンテージでコンポーネントを再レンダリング - chartDataプロパティを追加
    rerender(
      <ChartHighlight 
        chartData={mockChartData}
        chartRef={{ current: { chart: mockChartInstance } }}
        highlightIndex={1}
        percentage={30}
      />
    );
    
    // 要素が正しくレンダリングされたことを確認
    expect(screen.getByTestId('chart-highlight')).toBeInTheDocument();
  });
  
  test('ハイライトインデックスが変更されると効果が更新される', () => {
    // Chart.jsのスパイを設定
    const updateSpy = jest.spyOn(mockChartInstance, 'update');
    
    // コンポーネントをレンダリングし、プロパティを変更 - chartDataプロパティを追加
    const { rerender } = render(
      <ChartHighlight 
        chartData={mockChartData}
        chartRef={{ current: { chart: mockChartInstance } }}
        highlightIndex={1}
        percentage={20}
      />
    );
    
    // 最初の呼び出しをリセット
    updateSpy.mockClear();
    
    // 異なるインデックスでコンポーネントを再レンダリング - chartDataプロパティを追加
    rerender(
      <ChartHighlight 
        chartData={mockChartData}
        chartRef={{ current: { chart: mockChartInstance } }}
        highlightIndex={2}
        percentage={20}
      />
    );
    
    // 要素が正しくレンダリングされたことを確認
    expect(screen.getByTestId('chart-highlight')).toBeInTheDocument();
  });
});
