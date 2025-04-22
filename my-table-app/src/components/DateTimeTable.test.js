import React from 'react';
import { render, screen } from '@testing-library/react';
import DateTimeTable from './DateTimeTable';

describe('DateTimeTable', () => {
  test('データが正しく表示されること', () => {
    const testData = [
      { date: '2025-04-01', time: '12:00' },
      { date: '2025-04-02', time: '13:30' },
      { date: '2025-04-03', time: '15:45' }
    ];
    
    render(<DateTimeTable data={testData} />);
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    
    // データが表示されていることを確認
    testData.forEach(item => {
      expect(screen.getByText(item.date)).toBeInTheDocument();
      expect(screen.getByText(item.time)).toBeInTheDocument();
    });
  });
  
  test('空のデータでも正しく表示されること', () => {
    const emptyData = [];
    
    render(<DateTimeTable data={emptyData} />);
    
    // ヘッダーは表示されていることを確認
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    
    // データ行がないことを確認（tbody内に行が存在しないこと）
    const allRows = screen.getAllByRole('row');
    // ヘッダー行のみが存在する（データ行はない）
    expect(allRows.length).toBe(1);
  });
  
  test('大量のデータでも正しく表示されること', () => {
    // 多数のデータを生成
    const largeData = Array.from({ length: 20 }, (_, i) => ({
      date: `2025-04-${i + 1}`,
      time: `${10 + i}:00`
    }));
    
    render(<DateTimeTable data={largeData} />);
    
    // データ行の数がデータ配列の長さと同じであることを確認
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(largeData.length + 1); // ヘッダー行も含まれるため+1
  });
});