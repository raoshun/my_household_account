import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AggregatedTable from '../AggregatedTable';

// モックデータ
const mockAggregatedData = {
  '収入': {
    total: 100000,
    items: [{ id: 1 }, { id: 2 }, { id: 3 }]
  },
  '食費': {
    total: -50000,
    items: [{ id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
  },
  '未分類': {
    total: -10000,
    items: [{ id: 9 }, { id: 10 }]
  }
};

describe('AggregatedTable', () => {
  test('集計データが正しく表示される', () => {
    render(<AggregatedTable aggregatedData={mockAggregatedData} />);
    
    // カテゴリ名が表示されているか
    expect(screen.getByText('収入')).toBeInTheDocument();
    expect(screen.getByText('食費')).toBeInTheDocument();
    expect(screen.getByText('未分類')).toBeInTheDocument();
    
    // 合計金額が正しくフォーマットされて表示されているか
    expect(screen.getByText('¥100,000')).toBeInTheDocument();
    expect(screen.getByText('¥-50,000')).toBeInTheDocument();
    expect(screen.getByText('¥-10,000')).toBeInTheDocument();
  });

  test('項目数（アイテム数）が正しく表示される', () => {
    render(<AggregatedTable aggregatedData={mockAggregatedData} />);
    
    // 各カテゴリの項目数が正しく表示されているか
    expect(screen.getByText('3件')).toBeInTheDocument();
    expect(screen.getByText('5件')).toBeInTheDocument();
    expect(screen.getByText('2件')).toBeInTheDocument();
  });

  test('集計データが空の場合、適切なメッセージが表示される', () => {
    render(<AggregatedTable aggregatedData={{}} />);
    
    // 空データの場合のメッセージが表示されているか
    expect(screen.getByText('集計データがありません')).toBeInTheDocument();
  });

  test('未定義のデータが渡された場合、適切なメッセージが表示される', () => {
    render(<AggregatedTable aggregatedData={undefined} />);
    
    expect(screen.getByText('集計データがありません')).toBeInTheDocument();
  });

  test('金額の正負によってCSSクラスが適切に適用される', () => {
    render(<AggregatedTable aggregatedData={mockAggregatedData} />);
    
    // 収入（プラス値）に対するCSSクラス
    const positiveElement = screen.getByText('¥100,000').closest('td');
    expect(positiveElement).toHaveClass('positive-amount');
    expect(positiveElement).not.toHaveClass('negative-amount');
    
    // 支出（マイナス値）に対するCSSクラス
    const negativeElement = screen.getByText('¥-50,000').closest('td');
    expect(negativeElement).toHaveClass('negative-amount');
    expect(negativeElement).not.toHaveClass('positive-amount');
  });

  test('未分類カテゴリに特別なCSSクラスが適用される', () => {
    render(<AggregatedTable aggregatedData={mockAggregatedData} />);
    
    // 未分類カテゴリの行を取得
    const uncategorizedRow = screen.getByText('未分類').closest('tr');
    expect(uncategorizedRow).toHaveClass('uncategorized-row');
    
    // 他のカテゴリにはそのクラスがない
    const incomeRow = screen.getByText('収入').closest('tr');
    expect(incomeRow).not.toHaveClass('uncategorized-row');
  });

  test('itemsが配列でない場合も適切に処理される', () => {
    const invalidData = {
      'エラーケース': {
        total: 1000,
        items: "これは配列ではない"  // 文字列を渡す
      },
      'nullケース': {
        total: 2000,
        items: null  // nullを渡す
      },
      '未定義ケース': {
        total: 3000
        // itemsプロパティがない
      }
    };
    
    render(<AggregatedTable aggregatedData={invalidData} />);
    
    // すべてのケースで0件と表示されるべき
    expect(screen.getAllByText('0件').length).toBe(3);
  });
});