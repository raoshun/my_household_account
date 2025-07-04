/**
 * ResizeObserver関連のテスト用ユーティリティ
 * 
 * 使用例:
 * import { testElementResize } from '../test-utils/resizeObserverTest';
 * 
 * test('コンポーネントがリサイズに反応すること', async () => {
 *   const { container } = render(<ResizableComponent />);
 *   const element = container.querySelector('.resizable');
 *   
 *   // リサイズの検証
 *   const resizeTest = testElementResize(element);
 *   expect(resizeTest.hasResizeObserver()).toBe(true);
 *   
 *   // リサイズイベントをシミュレート
 *   await resizeTest.simulateResize({ width: 800, height: 600 });
 * });
 */

/**
 * 要素のResizeObserverをテストするヘルパー関数
 * @param {HTMLElement} element テスト対象のDOM要素
 * @return {Object} テスト用ヘルパーオブジェクト
 */
export function testElementResize(element) {
  // ResizeObserverのモックが利用可能か確認
  const isResizeObserverMocked = 
    typeof window !== 'undefined' && 
    window.ResizeObserver &&
    process.env.NODE_ENV === 'test' &&
    typeof (window.ResizeObserver.prototype as unknown as { simulateResize: unknown }).simulateResize === 'function';

  if (!isResizeObserverMocked) {
    console.warn('ResizeObserverのモックが利用できません。setupTests.jsでモックが正しく設定されているか確認してください。');
  }

  // 要素に関連付けられたResizeObserverインスタンスを探す
  const findResizeObservers = () => {
    if (!element) return [];
    
    // ResizeObserverが格納される可能性のあるプロパティを探す
    const observers = [];
    
    // 要素自身のプロパティを検索
    for (const key in element) {
      if (element[key] instanceof window.ResizeObserver) {
        observers.push(element[key]);
      }
    }
    
    // DOMノードにアタッチされたResizeObserver関連の内部プロパティ
    const internalProps = ['_ro', '__resizeObserver', '__observer'];
    internalProps.forEach(prop => {
      if (element[prop] instanceof window.ResizeObserver) {
        observers.push(element[prop]);
      }
    });
    
    return observers;
  };

  return {
    // ResizeObserverが設定されているか確認
    hasResizeObserver() {
      return findResizeObservers().length > 0;
    },
    
    // ResizeObserverインスタンスの数を返す
    countResizeObservers() {
      return findResizeObservers().length;
    },
    
    // リサイズイベントをシミュレート
    async simulateResize(dimensions = { width: 100, height: 100 }) {
      const observers = findResizeObservers();
      
      if (observers.length === 0) {
        if (globalThis.testResizeObserver) {
          // globalヘルパーを使用
          const helper = globalThis.testResizeObserver(element);
          return helper.simulateResize(dimensions);
        }
        return false;
      }
      
      // 各ResizeObserverでリサイズイベントをトリガー
      observers.forEach(observer => {
        if (typeof observer.simulateResize === 'function') {
          observer.simulateResize(element, dimensions);
        }
      });
      
      return true;
    },
    
    // 要素が監視中かどうか確認
    isBeingObserved() {
      const observers = findResizeObservers();
      return observers.some(observer => 
        typeof observer.observedElements === 'object' && 
        observer.observedElements.has(element)
      );
    }
  };
}

/**
 * テスト環境でResizeObserverがモック化されているか確認
 * @return {boolean} ResizeObserverのモックが利用可能かどうか
 */
export function isResizeObserverMocked() {
  return (
    typeof window !== 'undefined' && 
    window.ResizeObserver &&
    process.env.NODE_ENV === 'test' &&
    typeof (window.ResizeObserver.prototype as unknown as { simulateResize: unknown }).simulateResize === 'function'
  );
}
