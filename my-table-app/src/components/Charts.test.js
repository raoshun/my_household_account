import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Charts from './Charts';
import { Chart, ArcElement, PieController, Tooltip, Legend } from 'chart.js';

// Chart.jsのコンポーネント登録をモック化
jest.mock('chart.js', () => {
  const actual = jest.requireActual('chart.js');
  return {
    ...actual,
    Chart: jest.fn(),
    ArcElement: jest.fn(),
    PieController: jest.fn(),
    Tooltip: jest.fn(),
    Legend: jest.fn(),
    register: jest.fn()
  };
});

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

describe('Charts Component', () => {
  const mockOnClick = jest.fn();
  const mockOnHover = jest.fn();
  const mockOptions = { plugins: { tooltip: { callbacks: { label: jest.fn() } } } };

  // Canvas APIのモックを設定
  const mockContext = {
    clearRect: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    fillText: jest.fn(),
    setLineDash: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn()
    })),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    closePath: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // canvasのgetContextをモック化
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
    
    // Chart.jsのインスタンスを返すようにモック
    Chart.mockImplementation(() => ({
      destroy: jest.fn(),
      update: jest.fn(),
      data: mockPositiveChartData
    }));
  });

  test('renders positive and negative chart sections', () => {
    render(
      <Charts
        positiveChartData={mockPositiveChartData}
        negativeChartData={mockNegativeChartData}
        positiveTotal={6000}
        negativeTotal={35000}
        options={mockOptions}
        onHover={mockOnHover}
        onClick={mockOnClick}
      />
    );

    // 収入と支出の見出しが表示されていることを確認
    expect(screen.getByText('収入: ¥6,000')).toBeInTheDocument();
    expect(screen.getByText('支出: ¥35,000')).toBeInTheDocument();
    
    // canvasが2つ表示されていることを確認
    const canvasElements = document.querySelectorAll('canvas');
    expect(canvasElements.length).toBe(2);
    
    // テスト用のdata-testid属性が設定されていることを確認
    expect(screen.getByTestId('positive-chart')).toBeInTheDocument();
    expect(screen.getByTestId('negative-chart')).toBeInTheDocument();
  });

  test('creates Chart.js instances', () => {
    render(
      <Charts
        positiveChartData={mockPositiveChartData}
        negativeChartData={mockNegativeChartData}
        positiveTotal={6000}
        negativeTotal={35000}
        options={mockOptions}
        onHover={mockOnHover}
        onClick={mockOnClick}
      />
    );
    
    // Chart.jsのインスタンスが2つ作成されることを確認
    expect(Chart).toHaveBeenCalledTimes(2);
    
    // 1つ目のChart.jsインスタンスが正しいデータで作成されることを確認
    expect(Chart.mock.calls[0][1]).toEqual({
      type: 'pie',
      data: mockPositiveChartData,
      options: expect.objectContaining({ 
        plugins: expect.anything(), 
        onClick: expect.any(Function), 
        onHover: expect.any(Function) 
      }),
    });
    
    // 2つ目のChart.jsインスタンスが正しいデータで作成されることを確認
    expect(Chart.mock.calls[1][1]).toEqual({
      type: 'pie',
      data: mockNegativeChartData,
      options: expect.objectContaining({ 
        plugins: expect.anything(), 
        onClick: expect.any(Function), 
        onHover: expect.any(Function) 
      }),
    });
  });

  test('handles click events correctly', () => {
    // Chart.jsのクリックイベントシミュレーション用のモック関数を設定
    let onClickHandler;
    
    Chart.mockImplementation((ctx, config) => {
      onClickHandler = config.options.onClick;
      return {
        destroy: jest.fn(),
        update: jest.fn(),
        data: config.data
      };
    });
    
    render(
      <Charts
        positiveChartData={mockPositiveChartData}
        negativeChartData={mockNegativeChartData}
        positiveTotal={6000}
        negativeTotal={35000}
        options={mockOptions}
        onHover={mockOnHover}
        onClick={mockOnClick}
      />
    );
    
    // クリックイベントをシミュレーション
    const mockEvent = {};
    const mockElements = [{ index: 0 }]; // 最初のデータ要素をクリックしたと仮定
    
    // コンポーネントのクリックハンドラを呼び出す
    onClickHandler(mockEvent, mockElements, mockPositiveChartData);
    
    // 親コンポーネントのonClickが正しい値で呼び出されたかを確認
    expect(mockOnClick).toHaveBeenCalledWith('食費');
  });

  test('handles hover events correctly', () => {
    // Chart.jsのホバーイベントシミュレーション用のモック関数を設定
    let onHoverHandler;
    
    Chart.mockImplementation((ctx, config) => {
      onHoverHandler = config.options.onHover;
      return {
        destroy: jest.fn(),
        update: jest.fn(),
        data: config.data
      };
    });
    
    render(
      <Charts
        positiveChartData={mockPositiveChartData}
        negativeChartData={mockNegativeChartData}
        positiveTotal={6000}
        negativeTotal={35000}
        options={mockOptions}
        onHover={mockOnHover}
        onClick={mockOnClick}
      />
    );
    
    // ホバーイベントをシミュレーション
    const mockEvent = {};
    const mockElements = [{ index: 0 }]; // 最初のデータ要素の上にマウスがあると仮定
    
    // コンポーネントのホバーハンドラを呼び出す
    onHoverHandler(mockEvent, mockElements, mockPositiveChartData);
    
    // 親コンポーネントのonHoverが正しい値で呼び出されたかを確認
    expect(mockOnHover).toHaveBeenCalledWith({ 
      label: '食費',
      subtotal: 3000 
    });
  });
});