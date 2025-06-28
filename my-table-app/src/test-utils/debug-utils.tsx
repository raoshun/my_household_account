/**
 * テストデバッグ用のユーティリティ関数
 */

/**
 * コンポーネントのレンダリング結果を詳細に出力する
 * @param {Object} screen - @testing-library/react の screen オブジェクト
 */
export const debugRender = (screen) => {
  console.log('=== レンダリング結果 ===');
  console.log(screen.debug());
  
  // 全てのクエリ可能な要素をリスト表示
  console.log('=== 利用可能な要素 ===');
  const container = screen.queryByRole('document') || document.body;
  const elements = container.querySelectorAll('*');
  
  console.log(`見つかった要素数: ${elements.length}`);
  elements.forEach((el, i) => {
    if (el.getAttribute('data-testid')) {
      console.log(`[${i}] data-testid="${el.getAttribute('data-testid')}", タグ: ${el.tagName}`);
    } else if (el.id) {
      console.log(`[${i}] id="${el.id}", タグ: ${el.tagName}`);
    } else if (el.className) {
      console.log(`[${i}] class="${el.className}", タグ: ${el.tagName}`);
    }
  });
};

/**
 * モック関数の呼び出し状況をデバッグ出力
 * @param {Function} mockFn - Jest のモック関数
 * @param {string} name - モック関数の名前
 */
export const debugMock = (mockFn, name = 'モック関数') => {
  console.log(`=== ${name} の呼び出し状況 ===`);
  console.log(`呼び出し回数: ${mockFn.mock.calls.length}`);
  
  mockFn.mock.calls.forEach((call, index) => {
    console.log(`呼び出し #${index + 1}:`, call);
  });
  
  console.log(`返り値一覧:`, mockFn.mock.results.map(r => r.value));
};

/**
 * テスト実行中の状態を出力
 * @param {Object} state - 検証したい状態オブジェクト
 */
export const debugState = (state) => {
  console.log('=== 現在の状態 ===');
  console.log(JSON.stringify(state, null, 2));
};

/**
 * テスト失敗時のエラー詳細表示を強化
 * @param {Function} testFn - テスト関数
 * @returns {Function} エラー処理を含むテスト関数
 */
export const withDetailedError = (testFn) => {
  return async (...args) => {
    try {
      await testFn(...args);
    } catch (error) {
      console.error('=== テスト失敗の詳細 ===');
      console.error(`エラーメッセージ: ${error.message}`);
      
      if (error.matcherResult) {
        console.error('期待値:', error.matcherResult.expected);
        console.error('実際の値:', error.matcherResult.actual);
      }
      
      console.error('スタックトレース:', error.stack);
      throw error;
    }
  };
};
