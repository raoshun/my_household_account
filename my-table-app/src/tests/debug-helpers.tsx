/**
 * テストデバッグ用のヘルパー関数
 */

/**
 * コンポーネントのレンダリング結果をコンソールに出力する
 * @param {HTMLElement} container - テストのコンテナ要素
 */
export function debugDOM(container) {
  console.log('=== DOM構造 ===');
  console.log(container ? container.innerHTML : 'Container is null');
}

/**
 * テストのステータスを詳細に表示する
 * @param {Object} testInfo - テスト情報オブジェクト
 */
export function debugTest(testInfo) {
  console.log('=== テスト情報 ===');
  console.log(JSON.stringify(testInfo, null, 2));
}

/**
 * コンポーネントのプロパティをダンプする
 * @param {Object} props - コンポーネントのprops
 */
export function debugProps(props) {
  console.log('=== Props ===');
  console.log(JSON.stringify(props, null, 2));
}

/**
 * モック関数の呼び出し状況を詳細に表示
 * @param {Function} mockFn - Jestのモック関数
 * @param {string} name - モック関数の名前
 */
export function debugMock(mockFn, name = 'モック関数') {
  console.log(`=== ${name} 呼び出し状況 ===`);
  console.log(`呼び出し回数: ${mockFn.mock.calls.length}`);
  
  if (mockFn.mock.calls.length > 0) {
    console.log('呼び出し履歴:');
    mockFn.mock.calls.forEach((call, i) => {
      console.log(`${i + 1}回目:`, JSON.stringify(call));
    });
  }
  
  if (mockFn.mock.results && mockFn.mock.results.length > 0) {
    console.log('戻り値:');
    mockFn.mock.results.forEach((result, i) => {
      console.log(`${i + 1}回目: ${result.type}`, 
                  result.value ? JSON.stringify(result.value) : result.value);
    });
  }
}

/**
 * テスト対象のコンポーネントを検査し、重要な情報を出力
 * @param {Object} component - Reactコンポーネント
 */
export function debugComponent(component) {
  if (!component) {
    console.log('=== コンポーネント: undefined ===');
    return;
  }
  
  console.log('=== コンポーネント情報 ===');
  console.log('名前:', component.displayName || component.name || 'Unknown');
  
  if (component.propTypes) {
    console.log('PropTypes:');
    Object.keys(component.propTypes).forEach(key => {
      console.log(`- ${key}`);
    });
  }
  
  if (component.defaultProps) {
    console.log('DefaultProps:');
    console.log(component.defaultProps);
  }
}

/**
 * テスト失敗時により詳細な情報を提供する
 * @param {Error} error - キャッチされたエラー
 */
export function enhanceError(error) {
  console.log('=== テストエラー詳細 ===');
  console.log('メッセージ:', error.message);
  console.log('スタック:', error.stack);
  
  if (error.matcherResult) {
    console.log('期待値:', error.matcherResult.expected);
    console.log('実際の値:', error.matcherResult.actual);
    console.log('差分:', error.matcherResult.message());
  }
  
  return error;
}
