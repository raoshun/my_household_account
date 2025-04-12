/**
 * テストデバッグ用のユーティリティ関数
 */

/**
 * コンポーネントのレンダリング結果をコンソールに出力する
 * @param {Object} screen - @testing-library/react の screen オブジェクト
 */
export function dumpDOM(screen) {
  console.log('=== コンポーネントレンダリング結果 ===');
  if (screen && typeof screen.debug === 'function') {
    console.log(screen.debug());
  } else {
    console.log('screen.debugが利用できません');
  }
}

/**
 * 利用可能なすべてのロールを表示
 * @param {Object} screen - @testing-library/react の screen オブジェクト
 */
export function logAllRoles(screen) {
  console.log('=== 利用可能なすべてのロール ===');
  if (screen && typeof screen.logRoles === 'function') {
    console.log(screen.logRoles());
  } else if (screen && typeof screen.debug === 'function') {
    // ロール別に要素を集める
    const roles = {};
    
    document.querySelectorAll('[role]').forEach(el => {
      const role = el.getAttribute('role');
      if (!roles[role]) roles[role] = [];
      roles[role].push({
        element: el,
        name: el.textContent
      });
    });
    
    document.querySelectorAll('button').forEach(el => {
      if (!roles['button']) roles['button'] = [];
      roles['button'].push({
        element: el,
        name: el.textContent
      });
    });
    
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => {
        if (!roles['heading']) roles['heading'] = [];
        roles['heading'].push({
          element: el,
          name: el.textContent
        });
      });
    });
    
    Object.keys(roles).forEach(role => {
      console.log(`--- Role: ${role} ---`);
      roles[role].forEach((item, i) => {
        console.log(`[${i}] "${item.name}" (${item.element.tagName})`);
      });
    });
  } else {
    console.log('screen.logRolesが利用できません');
  }
}

/**
 * テキスト要素の検索結果を詳細出力
 * @param {Object} screen - @testing-library/react の screen オブジェクト
 * @param {string} text - 検索するテキスト
 */
export function debugTextElements(screen, text) {
  console.log(`=== テキスト "${text}" を含む要素の検索 ===`);
  
  try {
    // 完全一致
    const exactMatches = screen.getAllByText(text, { exact: true });
    console.log(`完全一致: ${exactMatches.length}件`);
    exactMatches.forEach((el, i) => {
      console.log(`[${i}] ${el.tagName}: ${el.textContent}`);
    });
  } catch {
    // エラー変数を使用しない
    console.log('完全一致なし');
  }
  
  try {
    // 部分一致
    const partialMatches = screen.getAllByText(new RegExp(text, 'i'));
    console.log(`部分一致: ${partialMatches.length}件`);
    partialMatches.forEach((el, i) => {
      console.log(`[${i}] ${el.tagName}: ${el.textContent}`);
    });
  } catch {
    // エラー変数を使用しない
    console.log('部分一致なし');
  }
}

/**
 * ボタン要素の検索結果を詳細出力
 * @param {Object} screen - @testing-library/react の screen オブジェクト
 */
export function debugButtons(screen) {
  console.log('=== ボタン要素の検索 ===');
  
  try {
    const buttons = screen.getAllByRole('button');
    console.log(`ボタン: ${buttons.length}件`);
    buttons.forEach((el, i) => {
      console.log(`[${i}] "${el.textContent}" class="${el.className}" data-testid="${el.getAttribute('data-testid') || ''}"`);
    });
  } catch {
    // エラー変数を使用しない
    console.log('ボタン要素なし');
  }
}

/**
 * テスト対象の属性付きの要素を検索
 * @param {Object} screen - @testing-library/react の screen オブジェクト
 * @param {string} attribute - 検索する属性名
 * @param {string} value - 属性の値（オプション）
 */
export function findElementsByAttribute(screen, attribute, value = null) {
  console.log(`=== 属性 "${attribute}" を持つ要素の検索 ===`);
  
  const container = screen.queryByRole('document') || document.body;
  const selector = value ? 
    `[${attribute}="${value}"]` : 
    `[${attribute}]`;
  
  const elements = container.querySelectorAll(selector);
  
  console.log(`見つかった要素数: ${elements.length}件`);
  elements.forEach((el, i) => {
    console.log(`[${i}] ${el.tagName}: ${el.textContent.slice(0, 50)}${el.textContent.length > 50 ? '...' : ''}`);
  });
}

/**
 * テスト実行時のデバッグヘルパー
 * @param {Function} testFn - テスト関数
 * @returns {Function} - デバッグ出力付きのテスト関数
 */
export function withDebug(testFn) {
  return async (...args) => {
    console.log('=== テスト開始 ===');
    try {
      const result = await testFn(...args);
      console.log('=== テスト成功 ===');
      return result;
    } catch (error) {
      console.error('=== テスト失敗 ===');
      console.error(`エラー: ${error.message}`);
      console.error(error.stack);
      throw error;
    }
  };
}
