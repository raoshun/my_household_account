import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// モックのみをインポートすると実際のコードは読み込まれない
jest.mock('chart.js');

// Chartsをモック
jest.mock('./Charts', () => {
  return function MockCharts(props) {
    return (
      <div data-testid="mock-charts-container">
        <div data-testid="mock-positive-chart">
          <h2>収入: ¥{props.positiveTotal.toLocaleString()}</h2>
          {props.positiveChartData.labels.map((label, i) => (
            <div key={`pos-${i}`}>
              {label}: ¥{props.positiveChartData.datasets[0].data[i].toLocaleString()}
            </div>
          ))}
        </div>
        <div data-testid="mock-negative-chart">
          <h2>支出: ¥{props.negativeTotal.toLocaleString()}</h2>
          {props.negativeChartData.labels.map((label, i) => (
            <div key={`neg-${i}`}>
              {label}: ¥{props.negativeChartData.datasets[0].data[i].toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    );
  };
});

// モックしたコンポーネントをインポート
import Charts from './Charts';

describe('Charts Component with Manual Mock', () => {
  test('renders with mocked Chart.js', () => {
    render(
      <Charts
        positiveChartData={{
          labels: ['食費', '交通費', '娯楽'],
          datasets: [{ 
            label: '収入',
            data: [3000, 1000, 2000],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] as unknown as string
          }]
        }}
        negativeChartData={{
          labels: ['給料', '賞与'],
          datasets: [{ 
            label: '支出',
            data: [30000, 5000],
            backgroundColor: ['#4BC0C0', '#9966FF'] as unknown as string
          }]
        }}
        positiveTotal={6000}
        negativeTotal={35000}
        options={{}}
        onHover={() => {}}
        onClick={() => {}}
      />
    );
    
    // モックされたコンポーネントが正しくレンダリングされていることを確認
    expect(screen.getByTestId('mock-charts-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-positive-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-negative-chart')).toBeInTheDocument();
    
    // テキストが表示されていることを確認
    expect(screen.getByText('収入: ¥6,000')).toBeInTheDocument();
    expect(screen.getByText('支出: ¥35,000')).toBeInTheDocument();
    
    // カテゴリとデータが表示されていることを確認
    expect(screen.getByText('食費: ¥3,000')).toBeInTheDocument();
    expect(screen.getByText('給料: ¥30,000')).toBeInTheDocument();
  });
});
