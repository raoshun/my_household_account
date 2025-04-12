import React from 'react';
import { render, screen } from '@testing-library/react';
import DataTable from './DataTable';

/* global test, expect */

test('DataTable renders correctly with data', () => {
  // テスト用のデータを作成
  const testData = [
    {
      '計算対象': '対象',
      '日付': '2023-01-01',
      '内容': 'テスト項目',
      '金額（円）': 1000,
      '保有金融機関': 'テスト銀行',
      '大項目': '食費',
      '中項目': '食料品',
      'メモ': 'テストメモ',
      '振替': '-'
    }
  ];
  
  // データを渡してコンポーネントをレンダリング
  render(<DataTable data={testData} />);
  
  // テーブルヘッダーが表示されていることを確認
  const headerElement = screen.getByText(/計算対象/i);
  expect(headerElement).toBeInTheDocument();
  
  // データが表示されていることを確認
  const contentElement = screen.getByText(/テスト項目/i);
  expect(contentElement).toBeInTheDocument();
});