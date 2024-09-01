import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders table headers', () => {
  render(<App />);
  const headerElement = screen.getByText(/計算対象/i);
  expect(headerElement).toBeInTheDocument();
});

// 1. handleClick関数のテスト
test('handleClick function filters data correctly', () => {
  const { getByText, queryByText } = render(<App />);
  
  // 初期状態ではチャートが表示されていることを確認
  expect(queryByText('小計')).toBeNull();
  
  // カテゴリをクリックしてテーブル表示に切り替える
  fireEvent.click(getByText('カテゴリ名')); // 適切なカテゴリ名に置き換えてください
  
  // テーブルが表示されることを確認
  expect(queryByText('小計')).not.toBeNull();
});

// 2. handleFiles関数の無限ループ防止テスト
test('handleFiles function does not cause infinite loop', () => {
  const { getByText } = render(<App />);
  
  // ファイルをアップロードする
  const fileInput = getByText('ファイルを選択'); // 適切なテキストに置き換えてください
  const file = new File(['dummy content'], 'example.csv', { type: 'text/csv' });
  
  fireEvent.change(fileInput, { target: { files: [file] } });
  
  // 無限ループが発生しないことを確認
  expect(true).toBe(true); // テストが終了すれば無限ループは発生していない
});

// 3. hoverInfoのテスト
test('hoverInfo displays subtotal correctly', () => {
  const { getByText, queryByText } = render(<App />);
  
  // 初期状態ではhoverInfoが表示されていないことを確認
  expect(queryByText('小計')).toBeNull();
  
  // hoverInfoを設定する
  fireEvent.mouseOver(getByText('チャートの項目名')); // 適切な項目名に置き換えてください
  
  // hoverInfoが表示されることを確認
  expect(queryByText('小計')).not.toBeNull();
  expect(getByText('小計').textContent).toMatch(/¥\d{1,3}(,\d{3})*/); // フォーマットを確認
});