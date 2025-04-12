import { act } from '@testing-library/react';

/**
 * コンポーネントの状態を更新し、更新が反映されるまで待機する
 * @param {Function} updateFn 状態を更新する関数
 * @param {number} waitTime 待機時間（ミリ秒）
 */
export async function updateStateAndWait(updateFn, waitTime = 100) {
  await act(async () => {
    updateFn();
    await new Promise(resolve => setTimeout(resolve, waitTime));
  });
}

/**
 * 状態更新が完了するまで待機する
 * @param {number} ms 待機時間（ミリ秒）
 */
export const waitForStateUpdate = async (ms = 100) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms));
  });
};

/**
 * テスト用にモックデータを作成する
 * @param {number} count レコード数
 * @param {string} category カテゴリ名
 * @returns {Array} モックデータの配列
 */
export const createMockData = (count = 5, category = '食費') => {
  return Array.from({ length: count }, (_, i) => ({
    大項目: category,
    中項目: i % 2 === 0 ? '定期' : '臨時',
    金額: (i + 1) * 1000
  }));
};

/**
 * テスト用にコンポーネントとその状態を設定する
 * @param {React.Component} Component テスト対象のコンポーネント
 * @param {Object} props コンポーネントのプロパティ
 * @param {Object} initialState 初期状態
 */
export function setupTestComponent(Component, props = {}, initialState = {}) {
  // コンポーネントに必要な設定を行う
  // ...
  return {
    Component,
    props: { ...props, initialData: initialState.data || [] }
  };
}
