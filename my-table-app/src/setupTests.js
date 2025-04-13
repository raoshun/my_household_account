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
if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    value: mockGetContext
  });
}

// Chart.jsのモック
jest.mock('chart.js', () => {
  const mockChartInstance = {
    destroy: jest.fn(),
    update: jest.fn(),
    data: { labels: [], datasets: [] }
  };

  const mockChart = jest.fn(() => mockChartInstance);
  
  // registerメソッドを追加
  mockChart.register = jest.fn();
  
  return {
    Chart: mockChart,
    ArcElement: jest.fn(),
    PieController: jest.fn(), 
    Tooltip: jest.fn(),
    Legend: jest.fn(),
    register: jest.fn()
  };
});

// テストデバッグ用の設定
const isDebugMode = process.env.TEST_DEBUG === 'true';

// デバッグログの設定
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

// ログラッパー
if (isDebugMode) {
  console.log = (...args) => {
    originalLog("[LOG]", ...args);
  };
  
  console.info = (...args) => {
    originalInfo("[INFO]", ...args);
  };
  
  console.warn = (...args) => {
    originalWarn("[WARN]", ...args);
  };
  
  console.error = (...args) => {
    originalError("[ERROR]", ...args);
  };

  // テスト開始時にデバッグモードを表示
  beforeAll(() => {
    console.log("テストデバッグモードが有効です");
    console.log("テスト環境:", process.env.NODE_ENV);
  });

  // 各テスト実行前に情報表示
  beforeEach(() => {
    const testPath = expect.getState().testPath;
    const testName = expect.getState().currentTestName;
    console.log("\n実行中のテスト:", testName);
  });

  // UIボタン検索デバッグヘルパー
  globalThis.debugButtons = (screen) => {
    console.log('=== 利用可能なボタン ===');
    try {
      const buttons = screen.getAllByRole('button');
      console.log(`全ボタン: ${buttons.length}件`);
      buttons.forEach((button, index) => {
        console.log(`[${index}] "${button.textContent}" (${button.getAttribute('class') || 'クラスなし'})`);
      });
    } catch (e) {
      console.log('ボタンが見つかりませんでした:', e.message);
    }
  };
} else {
  // デバッグモード無効時は最小限のログ
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  // エラーのみ表示
  console.error = (...args) => {
    originalError(...args);
  };
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
  constructor(callback) {
    this.callback = callback;
    this.observedElements = new Set();
  }
  
  observe(element) {
    // 要素を記録して監視
    this.observedElements.add(element);
  }
  
  unobserve(element) {
    // 要素の監視を解除
    this.observedElements.delete(element);
  }
  
  disconnect() {
    // すべての監視を解除
    this.observedElements.clear();
  }
  
  // テスト用：リサイズイベントをシミュレート
  simulateResize(element, contentRect = { width: 100, height: 100 }) {
    if (this.observedElements.has(element)) {
      this.callback([{ target: element, contentRect }]);
      return true;
    }
    return false;
  }
}

// ResizeObserverが未定義の場合はモックをグローバルに設定
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = MockResizeObserver;
}

// ResizeObserver テスト用ヘルパー関数
globalThis.testResizeObserver = (element) => {
  // 現在のResizeObserverインスタンスを探す
  const mockInstances = [];
  for (const key in element) {
    if (key.startsWith('__resizeObserver') && element[key] instanceof window.ResizeObserver) {
      mockInstances.push(element[key]);
    }
  }
  
  return {
    // ResizeObserverインスタンスの有無を確認
    exists: () => mockInstances.length > 0,
    // リサイズイベントをシミュレート
    simulateResize: (contentRect) => {
      if (mockInstances.length > 0) {
        mockInstances[0].simulateResize(element, contentRect);
        return true;
      }
      return false;
    },
    // ResizeObserverが対象要素を監視しているか確認
    isObserving: () => {
      if (mockInstances.length > 0) {
        return mockInstances[0].observedElements.has(element);
      }
      return false;
    }
  };
};

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
