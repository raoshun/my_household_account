/* eslint-disable */
// Jestテスト用グローバル変数の設定
globalThis.__TEST_DEBUG__ = process.env.TEST_DEBUG === 'true';

// jest関連オブジェクトをグローバルに公開
if (!globalThis.jest) {
  globalThis.jest = require('@jest/globals').jest;
}
if (!globalThis.describe) {
  globalThis.describe = require('@jest/globals').describe;
}
if (!globalThis.test) {
  globalThis.test = require('@jest/globals').test;
}
if (!globalThis.expect) {
  globalThis.expect = require('@jest/globals').expect;
}
if (!globalThis.beforeEach) {
  globalThis.beforeEach = require('@jest/globals').beforeEach;
}
if (!globalThis.beforeAll) {
  globalThis.beforeAll = require('@jest/globals').beforeAll;
}
if (!globalThis.afterEach) {
  globalThis.afterEach = require('@jest/globals').afterEach;
}
if (!globalThis.afterAll) {
  globalThis.afterAll = require('@jest/globals').afterAll;
}

// テスト用のユーティリティ関数
globalThis.isTestEnvironment = () => {
  return typeof jest !== 'undefined';
};
