/* eslint-disable */
import '@testing-library/jest-dom';

// テスト環境変数を設定
process.env.NODE_ENV = 'test';

// グローバルテストフラグを追加（デバッグ用）
globalThis.__TEST_DEBUG__ = process.env.TEST_DEBUG === 'true';

// HTMLCanvasElementのgetContextメソッドをモック
const mockGetContext = jest.fn(() => ({
  // Canvas API必要なメソッド
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4).fill(0)
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  // 追加のプロパティ
  canvas: {},
  fillStyle: '#000',
  strokeStyle: '#000',
  lineWidth: 1,
  font: '10px sans-serif'
}));

// HTML Canvas要素のモック
if (window.HTMLCanvasElement) {
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    value: mockGetContext
  });
}

// Chart.jsのモック
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: { labels: [], datasets: [] }
  })),
  ArcElement: jest.fn(),
  PieController: jest.fn(), 
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  register: jest.fn()
}));

// テストのデバッグヘルパー関数をグローバルに追加
if (globalThis.__TEST_DEBUG__) {
  // デバッグが有効な場合、コンソール出力を強化
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  // デバッグ情報を強化するためにコンソール出力を拡張
  console.log = (...args) => {
    originalLog('\x1b[32m[LOG]\x1b[0m', ...args);
  };
  console.error = (...args) => {
    originalError('\x1b[31m[ERROR]\x1b[0m', ...args);
  };
  console.warn = (...args) => {
    originalWarn('\x1b[33m[WARN]\x1b[0m', ...args);
  };
  console.info = (...args) => {
    originalInfo('\x1b[36m[INFO]\x1b[0m', ...args);
  };
  
  // テスト開始時に環境情報を出力
  beforeAll(() => {
    console.log('テストデバッグモードが有効です');
    console.log('テスト環境:', process.env.NODE_ENV);
  });
  
  // 各テストの開始時にテスト名を表示
  beforeEach(() => {
    if (expect.getState) {
      const testName = expect.getState().currentTestName;
      console.log(`\n\x1b[35m実行中のテスト: ${testName}\x1b[0m`);
    }
  });
}

// React警告のコンソール出力を抑制（テスト実行時のみ）
const originalConsoleError = console.error;
console.error = (...args) => {
  // React特有の警告を無視する（テスト結果に影響しない警告）
  if (args[0] && typeof args[0] === 'string') {
    const suppressedWarnings = [
      'Warning: %s: Support for defaultProps will be removed',
      'Warning: Using UNSAFE_'
    ];
    
    // 無視する警告の場合はログを出力しない
    for (const warning of suppressedWarnings) {
      if (args[0].includes(warning)) {
        return;
      }
    }
  }
  
  // 他のエラーは通常通り出力
  if (globalThis.__TEST_DEBUG__) {
    originalError('\x1b[31m[ERROR]\x1b[0m', ...args);
  } else {
    originalConsoleError(...args);
  }
};

// ResizeObserver APIのモック
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// ResizeObserverが未定義の場合はモックをグローバルに設定
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = MockResizeObserver;
}

// テスト環境チェックヘルパー
globalThis.isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test';
};

// テストのクリーンアップ
afterEach(() => {
  // モック関数をリセット
  if (mockGetContext) {
    mockGetContext.mockClear();
  }
});
