import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

test('サイドバーのボタンが正しく動作する', () => {
  // モック関数を作成
  const onViewChangeMock = jest.fn();
  const onFileUploadMock = jest.fn();
  
  // 必要なプロップスを渡してレンダリング
  render(
    <Sidebar 
      onViewChange={onViewChangeMock} 
      onFileUpload={onFileUploadMock}
      activeView="dashboard"
    />
  );
  
  // ダッシュボードボタンをチェック
  const dashboardButton = screen.getByRole('button', { name: /📊.*ダッシュボード/i });
  expect(dashboardButton).toBeInTheDocument();
  
  // ダッシュボードボタンをクリック
  fireEvent.click(dashboardButton);
  expect(onViewChangeMock).toHaveBeenCalledWith('dashboard');
  
  // 生データボタンをチェック
  const dataButton = screen.getByRole('button', { name: /📄.*生データ/i });
  expect(dataButton).toBeInTheDocument();
  
  // 生データボタンをクリック - viewの値は'data'に変更
  fireEvent.click(dataButton);
  expect(onViewChangeMock).toHaveBeenCalledWith('data');
  
  // 収支バランスボタンをチェック - 新しいテストケース
  const balanceButton = screen.getByRole('button', { name: /💹.*収支バランス/i });
  expect(balanceButton).toBeInTheDocument();
  expect(balanceButton).toHaveAttribute('data-testid', 'balance-button');
  
  // 収支バランスボタンをクリック
  fireEvent.click(balanceButton);
  expect(onViewChangeMock).toHaveBeenCalledWith('balance');
  
  // CSVアップロードボタンをチェック
  const uploadButton = screen.getByRole('button', { name: /📂.*CSVをアップロード/i });
  expect(uploadButton).toBeInTheDocument();
  
  // CSVアップロードボタンは通常ReactFileReader内にあり直接テストが難しいため、
  // ボタンが存在することのみ検証
});

test('現在のビューに応じてボタンがアクティブになる', () => {
  const onViewChangeMock = jest.fn();
  const onFileUploadMock = jest.fn();
  
  // balance ビューを現在のビューとしてレンダリング
  render(
    <Sidebar 
      onViewChange={onViewChangeMock}
      onFileUpload={onFileUploadMock}
      activeView="balance"
    />
  );
  
  // 収支バランスボタンがアクティブであることをチェック
  const balanceButton = screen.getByTestId('balance-button');
  expect(balanceButton.className).toContain('active'); // className全体にactiveが含まれていればOK
  
  // 他のボタンはアクティブでないことをチェック
  const dashboardButton = screen.getByTestId('dashboard-button');
  const rawdataButton = screen.getByTestId('rawdata-button');
  
  expect(dashboardButton.className).not.toContain('active');
  expect(rawdataButton.className).not.toContain('active');
});

// 期間フィルターのテストケースを追加
test('期間フィルターが正しく表示され、値を更新できる', () => {
  const onViewChangeMock = jest.fn();
  const onFileUploadMock = jest.fn();
  const onFilterChangeMock = jest.fn();
  const filters = {
    excludeTransfers: true,
    startDate: '',
    endDate: ''
  };
  
  // 必要なプロップスを渡してレンダリング
  render(
    <Sidebar 
      onViewChange={onViewChangeMock}
      onFileUpload={onFileUploadMock}
      filters={filters}
      onFilterChange={onFilterChangeMock}
    />
  );
  
  // 開始日と終了日の入力欄が表示されていることを確認
  const startDateInput = screen.getByTestId('start-date-input');
  const endDateInput = screen.getByTestId('end-date-input');
  
  expect(startDateInput).toBeInTheDocument();
  expect(endDateInput).toBeInTheDocument();
  
  // 開始日を設定
  const startDate = '2023-01-01';
  fireEvent.change(startDateInput, { target: { value: startDate } });
  expect(onFilterChangeMock).toHaveBeenCalledWith('startDate', startDate);
  
  // 終了日を設定
  const endDate = '2023-12-31';
  fireEvent.change(endDateInput, { target: { value: endDate } });
  expect(onFilterChangeMock).toHaveBeenCalledWith('endDate', endDate);
});

test('期間フィルターがクリアボタンで正しくリセットされる', () => {
  const onViewChangeMock = jest.fn();
  const onFileUploadMock = jest.fn();
  const onFilterChangeMock = jest.fn();
  const filters = {
    excludeTransfers: true,
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  };
  
  // 日付が設定された状態でレンダリング
  render(
    <Sidebar 
      onViewChange={onViewChangeMock}
      onFileUpload={onFileUploadMock}
      filters={filters}
      onFilterChange={onFilterChangeMock}
    />
  );
  
  // クリアボタンが表示されていることを確認
  const clearButton = screen.getByTestId('clear-date-filter');
  expect(clearButton).toBeInTheDocument();
  
  // クリアボタンをクリック
  fireEvent.click(clearButton);
  
  // startDateとendDateがクリアされたことを確認
  expect(onFilterChangeMock).toHaveBeenCalledWith('startDate', '');
  expect(onFilterChangeMock).toHaveBeenCalledWith('endDate', '');
});

test('期間フィルターが初期値にリセットされること', () => {
  const onViewChangeMock = jest.fn();
  const onFileUploadMock = jest.fn();
  const onFilterChangeMock = jest.fn();
  const filters = {
    excludeTransfers: true,
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  };
  const initialDateRange = {
    startDate: '2022-01-01',
    endDate: '2022-12-31'
  };
  
  // 日付が設定された状態でレンダリング（初期日付範囲も指定）
  render(
    <Sidebar 
      onViewChange={onViewChangeMock}
      onFileUpload={onFileUploadMock}
      filters={filters}
      onFilterChange={onFilterChangeMock}
      initialDateRange={initialDateRange}
    />
  );
  
  // クリアボタンが表示されていることを確認
  const resetButton = screen.getByTestId('clear-date-filter');
  expect(resetButton).toBeInTheDocument();
  expect(resetButton.textContent).toBe('期間フィルターを初期値にリセット');
  
  // リセットボタンをクリック
  fireEvent.click(resetButton);
  
  // startDateとendDateが初期値にリセットされたことを確認
  expect(onFilterChangeMock).toHaveBeenCalledWith('startDate', initialDateRange.startDate);
  expect(onFilterChangeMock).toHaveBeenCalledWith('endDate', initialDateRange.endDate);
});

test('初期値が指定されていない場合、リセットすると空の値になる', () => {
  const onViewChangeMock = jest.fn();
  const onFileUploadMock = jest.fn();
  const onFilterChangeMock = jest.fn();
  const filters = {
    excludeTransfers: true,
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  };
  
  // 初期日付範囲なしでレンダリング
  render(
    <Sidebar 
      onViewChange={onViewChangeMock}
      onFileUpload={onFileUploadMock}
      filters={filters}
      onFilterChange={onFilterChangeMock}
    />
  );
  
  // リセットボタンをクリック
  const resetButton = screen.getByTestId('clear-date-filter');
  fireEvent.click(resetButton);
  
  // 初期値がないので空文字でリセットされることを確認
  expect(onFilterChangeMock).toHaveBeenCalledWith('startDate', '');
  expect(onFilterChangeMock).toHaveBeenCalledWith('endDate', '');
});

test('フィルターが設定されていない場合、クリアボタンは表示されない', () => {
  const onViewChangeMock = jest.fn();
  const onFileUploadMock = jest.fn();
  const onFilterChangeMock = jest.fn();
  const filters = {
    excludeTransfers: true,
    startDate: '',
    endDate: ''
  };
  
  // 日付なしでレンダリング
  render(
    <Sidebar 
      onViewChange={onViewChangeMock}
      onFileUpload={onFileUploadMock}
      filters={filters}
      onFilterChange={onFilterChangeMock}
    />
  );
  
  // クリアボタンが存在しないことを確認
  const clearButton = screen.queryByTestId('clear-date-filter');
  expect(clearButton).not.toBeInTheDocument();
});