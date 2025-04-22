// TextEncoder/TextDecoderのポリフィル
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// MSWサーバーのインポート
const { server } = require('./mocks/server');

// MSWサーバーのセットアップ
beforeAll(() => {
  // APIリクエストをインターセプトするMSWサーバーを起動
  server.listen({ onUnhandledRequest: 'warn' });
  console.log('MSWサーバーが起動しました');
});

// 各テスト間でハンドラーをリセット
afterEach(() => {
  server.resetHandlers();
});

// すべてのテスト終了後にMSWサーバーをクローズ
afterAll(() => {
  server.close();
  console.log('MSWサーバーをクローズしました');
});