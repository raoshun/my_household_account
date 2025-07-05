/* eslint-disable */
// DataTransferのグローバルモック（Node.jsテスト環境用）
if (typeof global.DataTransfer === 'undefined' || typeof globalThis.DataTransfer === 'undefined') {
  class DataTransferMock {
    constructor() {
      this.files = [];
      this.types = [];
      this.dropEffect = 'none';
      this.effectAllowed = 'all';
      const self = this;
      this.items = {
        add(file) {
          self.files.push(file);
        },
        remove(index) {
          self.files.splice(index, 1);
        },
        clear() {
          self.files.length = 0;
        },
        get length() {
          return self.files.length;
        }
      };
    }
    clearData() {}
    getData() { return ''; }
    setData() {}
    setDragImage() {}
  }
  if (typeof global.DataTransfer === 'undefined') {
    // @ts-ignore
    global.DataTransfer = DataTransferMock;
  }
  if (typeof globalThis.DataTransfer === 'undefined') {
    // @ts-ignore
    globalThis.DataTransfer = DataTransferMock;
  }
}

// import '@testing-library/jest-dom';
import { jest, beforeEach, beforeAll, afterEach, expect } from '@jest/globals';

/**
 * Jestテストのグローバル設定
 */

// グローバルテストフラグを追加（デバッグ用）
globalThis.__TEST_DEBUG__ = process.env.TEST_DEBUG === 'true';

// テストのタイムアウト時間を延長（ミリ秒）
jest.setTimeout(10000);

// Node.js環境でfetch/Response/Request/Headersをグローバル定義
if (typeof global !== 'undefined') {
  try {
    // @ts-ignore
    const fetch = require('node-fetch');
    global.fetch = fetch;
    global.Headers = fetch.Headers;
    global.Request = fetch.Request;
    global.Response = fetch.Response;
  } catch (e) {
    // node-fetchがない場合は何もしない
  }
}

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

// テスト環境チェックヘルパー
globalThis.isTestEnvironment = () => {
  return typeof jest !== 'undefined';
};

// TextEncoderのモックを追加
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = class {
    constructor() {
      this.encoding = 'utf-8';
    }
    encode(str) {
      return new Uint8Array([...str].map(c => c.charCodeAt(0)));
    }
  };
}

// デバッグモード時の設定
if (globalThis.__TEST_DEBUG__) {
  // 各テスト開始時に通知
  beforeEach(() => {
    const testName = expect.getState().currentTestName;
    console.log(`\n----- テスト実行: ${testName} -----`);
  });
  
  // 各テスト終了時に通知
  afterEach(() => {
    const testName = expect.getState().currentTestName;
    console.log(`----- 完了: ${testName} -----\n`);
  });
}

// Chart.jsなどのブラウザAPIをモック化
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// テスト環境情報を出力
console.log('Jest設定ファイルが読み込まれました');
console.log(`テストデバッグモード: ${globalThis.__TEST_DEBUG__ ? '有効' : '無効'}`);
console.log(`Node環境: ${process.env.NODE_ENV}`);
