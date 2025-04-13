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
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/__mocks__/**',
    '!src/**/*.test.{js,jsx}'
  ],
  
  // テストのセットアップファイル
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // モックの設定
  moduleNameMapper: {
    // スタイルファイルやアセットのモック
    '\\.(css|less|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    // chart.jsを常に同じモックに置き換え
    '^chart.js/auto$': '<rootDir>/src/__mocks__/chart.js/auto.js'
  },
  
  // トランスフォーマー
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // トランスフォームを無視するファイル
  transformIgnorePatterns: [
    '/node_modules/(?!chart.js).+\\.js$'
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
  clearMocks: true,

  // カバレッジの閾値
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
