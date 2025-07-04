import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Charts from './Charts';
import { chartOptions } from '../config/chartOptions';
import type { TestEnvWindow } from '../types';

// テスト用データ
const mockPositiveChartData = {
  labels: ['食費', '交通費', '娯楽'],
  datasets: [{
    label: '支出',
    data: [3000, 1000, 2000],
    backgroundColor: '#FF6384', // 修正
    hoverBackgroundColor: '#FF6384' // 修正
  }]
};

const mockNegativeChartData = {
  labels: ['給料', '賞与'],
  datasets: [{
    label: '収入',
    data: [30000, 5000],
    backgroundColor: '#4BC0C0', // 修正
    hoverBackgroundColor: '#4BC0C0' // 修正
  }]
};

describe('チャートのホバー機能テスト', () => {
  let onHoverMock;
  
  beforeEach(() => {
    onHoverMock = jest.fn();
  });

  test('カスタムマウス移動ハンドラーが適切に動作することを確認', async () => {
    // テスト環境フラグを設定
    (window as TestEnvWindow).__JEST_TEST_ENV__ = true;
    
    await act(async () => {
      render(
        <Charts
          positiveChartData={mockPositiveChartData}
          negativeChartData={mockNegativeChartData}
          positiveTotal={6000}
          negativeTotal={35000}
          options={chartOptions}
          onHover={onHoverMock}
          onClick={jest.fn()}
        />
      );
    });

    // テスト環境向けモックUIでテスト
    const positiveChartElem = screen.getByTestId('mock-positive-chart');
    console.log('Found chart element:', positiveChartElem);
    
    // チャートの項目にマウスを移動
    const foodItem = screen.getByText(/食費/);
    fireEvent.mouseOver(foodItem);
    fireEvent.mouseMove(foodItem);

    // ホバーハンドラーが呼び出されることを確認
    expect(onHoverMock).toHaveBeenCalled();
    
    // ホバー情報が正しく渡されることを確認
    const hoverCall = onHoverMock.mock.calls.find(call => 
      call[0] && call[0].label === '食費'
    );
    
    expect(hoverCall).toBeTruthy();
    expect(hoverCall[0]).toHaveProperty('subtotal', 3000);
  });
  
  test('実環境ではカスタムmousemoveハンドラーが設定されることを確認', async () => {
    // テスト環境フラグを解除してrealDOMをシミュレート
    (window as TestEnvWindow).__JEST_TEST_ENV__ = false;
    
    // Canvasをモック
    const mockCanvas = document.createElement('canvas');
    const mousemoveSpy = jest.fn();
    const mouseleaveSpy = jest.fn();
    
    // モックプロパティの設定
    Object.defineProperty(mockCanvas, 'onmousemove', {
      set: mousemoveSpy,
      configurable: true
    });
    
    Object.defineProperty(mockCanvas, 'onmouseleave', {
      set: mouseleaveSpy,
      configurable: true
    });
    
    // getBoundingClientRectをモック
    mockCanvas.getBoundingClientRect = () => ({
      width: 200,
      height: 200,
      left: 0,
      top: 0,
      right: 200,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });
    
    // querySelectorのモック
    const originalQuerySelector = document.querySelector;
    document.querySelector = jest.fn().mockReturnValue(mockCanvas);
    
    // Refを取得するためのモックコンポーネント
    function MockCharts() {
      React.useRef(mockCanvas);
      return <div data-testid="mock-component"></div>;
    }
    
    // Chart.jsコンポーネントをモック
    jest.mock('./Charts', () => {
      return MockCharts;
    });
    
    await act(async () => {
      render(
        <Charts
          positiveChartData={mockPositiveChartData}
          negativeChartData={mockNegativeChartData}
          positiveTotal={6000}
          negativeTotal={35000}
          options={chartOptions}
          onHover={onHoverMock}
          onClick={jest.fn()}
        />
      );
    });
    
    // モックを元に戻す
    document.querySelector = originalQuerySelector;
    (window as TestEnvWindow).__JEST_TEST_ENV__ = true;
    
    // mousemoveハンドラーが設定されたことを確認
    expect(mousemoveSpy).toHaveBeenCalled();
    expect(mouseleaveSpy).toHaveBeenCalled();
  });
});
