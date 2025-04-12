// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
/* eslint-env jest, browser */
import '@testing-library/jest-dom';

// グローバル変数が定義されていないエラーを防ぐためにコメントを追加
/* global jest */

// Chart.js のモック
jest.mock('chart.js', () => {
  const mockChartInstance = {
    destroy: jest.fn(),
    update: jest.fn()
  };
  
  const mockChart = jest.fn(() => mockChartInstance);
  mockChart.register = jest.fn();
  
  return {
    Chart: mockChart,
    ArcElement: jest.fn(),
    PieController: jest.fn()
  };
});

// TextEncoderのモックを追加
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = class {
    encode(str) {
      return new Uint8Array([...str].map(c => c.charCodeAt(0)));
    }
  };
}

// URL APIのモック
if (typeof globalThis.URL !== 'object') {
  globalThis.URL = {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  };
}

// Canvas APIのモック
class MockCanvas {
  getContext() {
    return {
      // Chart.jsが使用するメソッドをモック化
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
  }
}

// Canvas要素のgetContextメソッドをモック化
HTMLCanvasElement.prototype.getContext = function() {
  return new MockCanvas().getContext();
};
