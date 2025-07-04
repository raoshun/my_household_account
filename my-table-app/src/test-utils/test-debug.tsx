// テスト用のデバッグユーティリティ
import { prettyDOM } from '@testing-library/react';

/**
 * DOMツリーを整形して表示する
 * @param {Object} screen - テスト用スクリーンオブジェクト
 */
export const dumpDOM = (screen) => {
  console.log('=== DOM TREE ===');
  console.log(prettyDOM(screen.container, 10000, { highlight: false }));
  console.log('=== END DOM TREE ===');
};

/**
 * 画面に表示されている全てのロールを表示
 * @param {Object} screen - テスト用スクリーンオブジェクト
 */
export const logAllRoles = (screen) => {
  console.log('=== ALL ROLES ===');
  console.log(prettyDOM(screen.container, undefined, { highlight: false }));
  console.log('=== END ALL ROLES ===');
};

/**
 * 画面上のすべてのボタンを表示
 * @param {Object} screen - テスト用スクリーンオブジェクト
 */
export const debugButtons = (screen) => {
  console.log('=== BUTTONS ===');
  try {
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button, index) => {
      console.log(`Button ${index + 1}:`, button.textContent);
    });
  } catch {
    console.log('No buttons found');
  }
  console.log('=== END BUTTONS ===');
};

/**
 * 特定のテキストを含む要素を探してデバッグ表示する
 * @param {Object} screen - テスト用スクリーンオブジェクト
 * @param {string} text - 検索するテキスト
 */
export const debugTextElements = (screen, text) => {
  console.log(`=== ELEMENTS WITH TEXT: "${text}" ===`);
  try {
    const elements = screen.getAllByText((content) => {
      return content.includes(text);
    });
    elements.forEach((element, index) => {
      console.log(`Element ${index + 1}:`, {
        tagName: element.tagName,
        textContent: element.textContent,
        role: element.getAttribute('role'),
        className: element.className
      });
    });
  } catch {
    console.log(`No elements found with text containing "${text}"`);
    // DOM全体をダンプしてテキストを探す
    console.log('Full DOM for reference:');
    console.log(prettyDOM(screen.container, 500));
  }
  console.log(`=== END ELEMENTS WITH TEXT: "${text}" ===`);
};

/**
 * 特定の属性を持つすべての要素を見つける
 * @param {Object} screen - テスト用スクリーンオブジェクト
 * @param {string} attribute - 検索する属性（例: 'data-testid'）
 */
export const findElementsByAttribute = (screen, attribute) => {
  console.log(`=== ELEMENTS WITH ${attribute} ===`);
  if (!screen || !screen.container) {
    console.log(`Error: screen or screen.container is undefined`);
    console.log(`=== END ELEMENTS WITH ${attribute} ===`);
    return;
  }
  
  const elements = screen.container.querySelectorAll(`[${attribute}]`);
  if (elements.length === 0) {
    console.log(`No elements with ${attribute} attribute found`);
  } else {
    elements.forEach((el, index) => {
      const attributeValue = el.getAttribute(attribute);
      console.log(`Element ${index + 1}:`, {
        attribute: `${attribute}="${attributeValue}"`,
        tagName: el.tagName,
        textContent: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? '...' : '')
      });
    });
  }
  console.log(`=== END ELEMENTS WITH ${attribute} ===`);
};
