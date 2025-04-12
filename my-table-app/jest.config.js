/* eslint-disable no-undef */
/* eslint-env node */
module.exports = {
  // テスト環境
  testEnvironment: 'jsdom',
  
  // テストの場所
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)+(spec|test).js?(x)'
  ],
  
  // モック設定
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
    '\\.csv$': '<rootDir>/src/tests/__mocks__/csvMock.js'
  },
  
  // テストのセットアップファイル
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // カバレッジレポート
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  
  // 変換設定
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  
  // 変換を無視するパターン
  transformIgnorePatterns: [
    '/node_modules/(?!papaparse|chart.js).+\\.js$'
  ],
  
  // テストタイムアウト設定
  testTimeout: 10000,
  
  // カスタムテスト環境変数
  globals: {
    __TEST__: true
  }
};
