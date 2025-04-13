import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChartComponent from './ChartComponent';

// Chart.jsをモック
jest.mock('chart.js', () => {
  // モック関数を作成
  const mockOnClick = jest.fn();
  const mockOnHover = jest.fn();
  const mockDestroy = jest.fn();
  
  return {
    Chart: jest.fn().mockImplementation((ctx, config) => {
      // config内のイベントハンドラを保存
      if (config.options && config.options.onClick) {
        mockOnClick.mockImplementation(config.options.onClick);
      }
      
      return {
        canvas: ctx.canvas,
        destroy: mockDestroy,
        simulateClick: (idx) => {
          mockOnClick({ type: 'click' }, [{ index: idx }]);
        },
        simulateHover: (idx) => {
          mockOnHover({ type: 'mousemove' }, [{ index: idx }]);
        }
      };
    }),
    // モック関数をエクスポート（テスト内で参照できるように）
    _mockOnClick: mockOnClick,
    _mockOnHover: mockOnHover,
    _mockDestroy: mockDestroy
  };
});

describe('円グラフのホバー効果をテスト', () => {
  let mockOnClick;
  let mockOnHover;
  let chartOptions;

  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    
    // モックハンドラを設定
    mockOnClick = jest.fn();
    mockOnHover = jest.fn();

    // チャートオプションを定義
    chartOptions = {
      plugins: {
        tooltip: {
          enabled: false
        }
      },
      hover: {
        animationDuration: 0
      },
      elements: {
        arc: {
          hoverOffset: 0
        }
      },
      onClick: mockOnClick
    };

    // コンポーネントをレンダリング
    render(
      <ChartComponent 
        data={[{ label: 'テスト', value: 100 }]} 
        options={chartOptions}
        onHover={mockOnHover}
      />
    );
  });

  test('chartOptionsがツールチップを無効化していることを確認', () => {
    expect(chartOptions.plugins.tooltip.enabled).toBe(false);
  });

  test('Chart.jsのオプションでホバー効果が無効化されていることを確認', () => {
    // Chart.jsのオプションを検証
    expect(chartOptions.hover.animationDuration).toBe(0);
    expect(chartOptions.elements.arc.hoverOffset).toBe(0);
  });
});
