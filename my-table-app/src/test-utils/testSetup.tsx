// テスト共通のsetup/teardownユーティリティ
import MockFileReader from './fileReaderMock';
import type { TestEnvWindow } from '../types';

export function setupTestEnvironment() {
  // FileReaderのグローバルモック
  if (process.env.NODE_ENV === 'test') {
    globalThis._originalFileReader = window.FileReader;
    window.FileReader = MockFileReader as typeof FileReader;
    (window as TestEnvWindow).__JEST_TEST_ENV__ = true;
  }
}

export function cleanupTestEnvironment() {
  // FileReaderのグローバルモック解除
  if (globalThis._originalFileReader) {
    window.FileReader = globalThis._originalFileReader;
    delete globalThis._originalFileReader;
  }
}
