// TextEncoder/TextDecoderのポリフィル
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// MSWサーバーのインポート
import { server } from './mocks/server';

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