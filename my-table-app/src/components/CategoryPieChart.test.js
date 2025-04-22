import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryPieChart from './CategoryPieChart';

// Rechartsコンポーネントのモック
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: ({ fill }) => <div data-testid="cell" data-fill={fill}></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>
}));

describe('CategoryPieChart', () => {
  test('レンダリングが正常に行われること', () => {
    const testData = {
      '食費': 10000,
      '交通費': 5000,
      '光熱費': 8000
    };
    
    render(<CategoryPieChart data={testData} />);
    
    // 各コンポーネントが存在するか確認
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    
    // 各カテゴリのセルが存在するか確認
    const cells = screen.getAllByTestId('cell');
    expect(cells.length).toBe(3); // 3カテゴリなので3セル
  });
  
  test('空のデータがあっても正常に処理できること', () => {
    const emptyData = {};
    
    render(<CategoryPieChart data={emptyData} />);
    
    // チャートコンポーネントが存在するか確認
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    
    // セルがないことを確認
    const cells = screen.queryAllByTestId('cell');
    expect(cells.length).toBe(0);
  });
  
  test('色が正しく割り当てられること', () => {
    const testData = {
      'カテゴリ1': 1000,
      'カテゴリ2': 2000,
      'カテゴリ3': 3000,
      'カテゴリ4': 4000,
      'カテゴリ5': 5000  // 5つ目のカテゴリは色のローテーションが発生
    };
    
    render(<CategoryPieChart data={testData} />);
    
    // セルの色属性を確認
    const cells = screen.getAllByTestId('cell');
    expect(cells.length).toBe(5);
    
    // 色のローテーションをチェック
    expect(cells[0].dataset.fill).toBe('#0088FE');
    expect(cells[1].dataset.fill).toBe('#00C49F');
    expect(cells[2].dataset.fill).toBe('#FFBB28');
    expect(cells[3].dataset.fill).toBe('#FF8042');
    expect(cells[4].dataset.fill).toBe('#0088FE'); // 最初の色に戻る
  });
});