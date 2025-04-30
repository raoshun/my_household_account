// テスト共通のsetup/teardownユーティリティ
import MockFileReader from './fileReaderMock';

export function setupTestEnvironment() {
  // FileReaderのグローバルモック
  globalThis._originalFileReader = window.FileReader;
  window.FileReader = MockFileReader;
  window.__JEST_TEST_ENV__ = true;
}

export function cleanupTestEnvironment() {
  // FileReaderのグローバルモック解除
  if (globalThis._originalFileReader) {
    window.FileReader = globalThis._originalFileReader;
    delete globalThis._originalFileReader;
  }
}
