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
    '!src/mocks/**',
    '!src/**/*.test.{js,jsx}'
  ],
  
  // テストのセットアップファイル
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.tsx',
    '<rootDir>/src/jest.setup.msw.tsx'
  ],
  
  // モックの設定
  moduleNameMapper: {
    // スタイルファイルやアセットのモック - 新しい場所を参照
    '\\.(css|less|sass|scss)$': '<rootDir>/src/mocks/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/src/mocks/fileMock.js',
    // chart.jsを常に同じモックに置き換え - 新しい場所を参照
    '^chart.js/auto$': '<rootDir>/src/mocks/chart.js',
    '^chart.js$': '<rootDir>/src/mocks/chart.js'
  },
  
  // トランスフォーマー
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // トランスフォームを無視するファイル - msw関連を除外
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs|@bundled-es-modules|@whatwg-node|chart.js)).+\\.js$'
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

  // カバレッジの閾値 - より現実的な値に設定
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
