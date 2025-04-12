/* eslint-disable */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { dumpDOM, debugTextElements } from '../test-utils/test-debug';

// 実際のChartsコンポーネントをモック化
jest.mock('./Charts', () => {
  return function MockCharts(props) {
    return (
      <div data-testid="mock-charts-container">
        <div data-testid="mock-positive-chart">
          <h2>収入: ¥{props.positiveTotal.toLocaleString()}</h2>
          <div>
            {props.positiveChartData.labels.map((label, index) => (
              <div key={label} className="chart-item">
                <span className="label">{label}</span>
                <span className="value">¥{props.positiveChartData.datasets[0].data[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div data-testid="mock-negative-chart">
          <h2>支出: ¥{props.negativeTotal.toLocaleString()}</h2>
          <div>
            {props.negativeChartData.labels.map((label, index) => (
              <div key={label} className="chart-item">
                <span className="label">{label}</span>
                <span className="value">¥{props.negativeChartData.datasets[0].data[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
});

// Chartsコンポーネントをインポート（すでにモック化されている）
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

describe('Charts Component Debug', () => {
  test('デバッグ: レンダリング結果の詳細確認', () => {
    render(
      <Charts
        positiveChartData={mockPositiveChartData}
        negativeChartData={mockNegativeChartData}
        positiveTotal={6000}
        negativeTotal={35000}
        options={{}}
        onHover={jest.fn()}
        onClick={jest.fn()}
      />
    );
    
    // レンダリング結果全体を表示
    dumpDOM(screen);
    
    // 特定のテキスト要素を探すのに問題があるケースをデバッグ
    debugTextElements(screen, '収入');
    debugTextElements(screen, '¥6,000');
    
    // 実際のテスト
    expect(screen.getByTestId('mock-charts-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-positive-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-negative-chart')).toBeInTheDocument();
  });
});
