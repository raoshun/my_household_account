/* eslint-disable */
module.exports = {
  // テスト環境
  testEnvironment: 'jsdom',
  
  // テスト対象のファイルパターン
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  
  // 無視するファイルパターン
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/build/'
  ],
  
  // カバレッジの設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js',
    '!src/reportWebVitals.js'
  ],
  
  // テストのセットアップファイル
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // モックの設定
  moduleNameMapper: {
    // スタイルファイルやアセットのモック
    '\\.(css|less|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/__mocks__/fileMock.js',
    // chart.jsを常に同じモックに置き換え
    'chart.js$': '<rootDir>/src/__mocks__/chart.js'
  },
  
  // トランスフォーマー
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest'
  },
  
  // トランスフォームを無視するファイル
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  
  // 設定ファイル
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'node'
  ],
  
  // コンソールの設定
  verbose: true,
  
  // グローバル設定のリセット
  resetMocks: false,
  restoreMocks: true,
  clearMocks: true
};
