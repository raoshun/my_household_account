import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BalanceView from './BalanceView';

// モックデータの作成
const createMockData = (isPositive = true) => {
  return {
    labels: ['カテゴリ1', 'カテゴリ2', 'カテゴリ3'],
    datasets: [{
      label: isPositive ? '収入' : '支出',
      data: [50000, 30000, 20000],
      backgroundColor: '#FF6384',
      hoverBackgroundColor: '#FF6384'
    }]
  };
};

const baseProps = {
  positiveTotal: 50000,
  negativeTotal: -30000,
  positiveData: createMockData(true),
  negativeData: createMockData(false),
  data: [],
};

describe('BalanceView コンポーネント', () => {
  // 基本的なレンダリングテスト
  test('コンポーネントが正常にレンダリングされる', () => {
    render(<BalanceView {...baseProps} />);
    
    expect(screen.getByText('収支バランス')).toBeInTheDocument();
    expect(screen.getByText('今月の収支')).toBeInTheDocument();
  });
  
  // 黒字状態テスト
  test('黒字状態（surplus）が正しく表示される', () => {
    const positiveTotal = 100000;
    const negativeTotal = -80000;
    const positiveData = createMockData(true);
    const negativeData = createMockData(false);
    
    render(
      <BalanceView 
        positiveTotal={positiveTotal}
        negativeTotal={negativeTotal} 
        positiveData={positiveData}
        negativeData={negativeData}
        data={[]}
      />
    );
    
    // 収支合計をチェック（20000円の黒字）- より具体的なセレクタを使用
    const summaryCard = screen.getByText('今月の収支').closest('.balance-summary-card');
    expect(within(summaryCard).getByText('¥20,000') as HTMLElement).toBeInTheDocument();
    expect(screen.getByText('黒字')).toBeInTheDocument();
    
    // 黒字用のアドバイスが表示されているか
    expect(screen.getByText('黒字状態です！貯金や投資を検討しましょう。')).toBeInTheDocument();
  });
  
  // 赤字状態テスト
  test('赤字状態（deficit）が正しく表示される', () => {
    const positiveTotal = 50000;
    const negativeTotal = -80000;
    const positiveData = createMockData(true);
    const negativeData = createMockData(false);
    
    render(
      <BalanceView 
        positiveTotal={positiveTotal}
        negativeTotal={negativeTotal} 
        positiveData={positiveData}
        negativeData={negativeData}
        data={[]}
      />
    );
    
    // 収支合計をチェック（30000円の赤字）- より具体的なセレクタを使用
    const summaryCard = screen.getByText('今月の収支').closest('.balance-summary-card');
    expect(within(summaryCard).getByText('¥-30,000') as HTMLElement).toBeInTheDocument();
    expect(screen.getByText('赤字')).toBeInTheDocument();
    
    // 赤字用のアドバイスが表示されているか
    expect(screen.getByText('赤字状態です。支出を見直しましょう。')).toBeInTheDocument();
  });
  
  // 収支均衡状態テスト
  test('収支均衡状態（break-even）が正しく表示される', () => {
    const positiveTotal = 80000;
    const negativeTotal = -80000;
    const positiveData = createMockData(true);
    const negativeData = createMockData(false);
    
    render(
      <BalanceView 
        positiveTotal={positiveTotal}
        negativeTotal={negativeTotal} 
        positiveData={positiveData}
        negativeData={negativeData}
        data={[]}
      />
    );
    
    // 収支合計をチェック（0円で均衡）- より具体的なセレクタを使用
    const summaryCard = screen.getByText('今月の収支').closest('.balance-summary-card');
    expect(within(summaryCard).getByText('¥0') as HTMLElement).toBeInTheDocument();
    expect(screen.getByText('収支均衡')).toBeInTheDocument();
    
    // 収支均衡用のアドバイスが表示されているか
    expect(screen.getByText('収支が均衡しています。')).toBeInTheDocument();
  });
  
  // データがない場合のテスト
  test('データがない場合も正しく表示される', () => {
    render(<BalanceView {...baseProps} />);
    
    expect(screen.getByText('収入データがありません')).toBeInTheDocument();
    expect(screen.getByText('支出データがありません')).toBeInTheDocument();
  });
  
  // 収入、支出カテゴリのレンダリングテスト
  test('収入と支出のカテゴリが正しくレンダリングされる', () => {
    const positiveTotal = 100000;
    const negativeTotal = -80000;
    const positiveData = createMockData(true);
    const negativeData = createMockData(false);
    
    render(
      <BalanceView 
        positiveTotal={positiveTotal}
        negativeTotal={negativeTotal} 
        positiveData={positiveData}
        negativeData={negativeData}
        data={[]}
      />
    );
    
    // カテゴリ名が表示されているか
    expect(screen.getAllByText('カテゴリ1')).toHaveLength(2); // 収入と支出の両方に存在
    expect(screen.getAllByText('カテゴリ2')).toHaveLength(2);
    expect(screen.getAllByText('カテゴリ3')).toHaveLength(2);
    
    // 収入・支出の合計が表示されているか
    expect(screen.getByText('収入: ¥100,000')).toBeInTheDocument();
    expect(screen.getByText('支出: ¥80,000')).toBeInTheDocument();
  });
  
  // 比率バーのテスト
  test('収入と支出の比率が正しく計算される', () => {
    const positiveTotal = 60000;
    const negativeTotal = -40000;
    const positiveData = createMockData(true);
    const negativeData = createMockData(false);
    
    render(
      <BalanceView 
        positiveTotal={positiveTotal}
        negativeTotal={negativeTotal} 
        positiveData={positiveData}
        negativeData={negativeData}
        data={[]}
      />
    );
    
    // 比率のパーセンテージがレンダリングされているかチェック
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});