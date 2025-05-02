import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvestmentView from './InvestmentView';

// Chart.jsをモック化
jest.mock('chart.js');
jest.mock('react-chartjs-2', () => ({
  Pie: (props) => (
    <div data-testid="mock-pie-chart" data-chart-data={JSON.stringify(props.data)}>
      <div>円グラフコンポーネント</div>
      {props.data.labels.map((label, i) => (
        <div key={i} data-label={label} data-value={props.data.datasets[0].data[i]}>
          {label}: {props.data.datasets[0].data[i]}
        </div>
      ))}
    </div>
  ),
  Line: (props) => (
    <div data-testid="mock-line-chart" data-chart-data={JSON.stringify(props.data)}>
      <div>折れ線グラフコンポーネント</div>
      {props.data.labels.map((label, i) => (
        <div key={i} data-month={label}>
          {props.data.datasets.map((dataset, j) => (
            <span key={j} data-dataset={dataset.label} data-value={dataset.data[i]}>
              {dataset.label}: {dataset.data[i]}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}));

describe('InvestmentView', () => {
  // テスト用のサンプルデータ
  const mockData = [
    { '大項目': '株式', '中項目': '配当', '金額（円）': 5000, '日付': '2023/01/10' },
    { '大項目': '株式', '中項目': '売却', '金額（円）': 15000, '日付': '2023/01/20' },
    { '大項目': '投資信託', '中項目': '分配金', '金額（円）': 2000, '日付': '2023/02/05' },
    { '大項目': '不動産', '中項目': '家賃収入', '金額（円）': 80000, '日付': '2023/01/25' },
    { '大項目': '食費', '中項目': '食料品', '金額（円）': -5000, '日付': '2023/01/15' } // 関連しないデータ
  ];

  test('空のデータで正しくレンダリングされる', () => {
    render(<InvestmentView data={[]} />);
    
    // 各タブが表示されていることを確認
    expect(screen.getByText('概要')).toBeInTheDocument();
    expect(screen.getByText('株式・投資信託')).toBeInTheDocument();
    // 重複要素を処理するためにボタン要素に限定
    expect(screen.getByRole('button', { name: '不動産' })).toBeInTheDocument();
    expect(screen.getByText('推移')).toBeInTheDocument();
    
    // 初期状態では「概要」タブが表示される
    expect(screen.getByText('投資ポートフォリオ概要')).toBeInTheDocument();
    
    // データがない場合でも各カテゴリの合計が0円で表示される
    expect(screen.getByText('総投資額')).toBeInTheDocument();
    // 全角円記号を使用
    expect(screen.getAllByText(/￥0/)).toHaveLength(4);
  });

  test('株式・投資信託データがある場合に正しく表示される', () => {
    render(<InvestmentView data={mockData} />);
    
    // 「株式・投資信託」タブをクリック
    fireEvent.click(screen.getByText('株式・投資信託'));
    
    // 株式・投資信託詳細セクションが表示される
    expect(screen.getByText('株式・投資信託詳細')).toBeInTheDocument();
    
    // テーブルヘッダーが存在することを確認
    expect(screen.getByText('日付')).toBeInTheDocument();
    expect(screen.getByText('種類')).toBeInTheDocument();
    expect(screen.getByText('金額')).toBeInTheDocument();
    
    // 株式データが表示される
    expect(screen.getByText('配当')).toBeInTheDocument();
    expect(screen.getByText('売却')).toBeInTheDocument();
    expect(screen.getByText('分配金')).toBeInTheDocument();
    
    // 金額が正しく表示される（全角円記号を使用）
    const amounts = screen.getAllByText(/￥[0-9,]+/);
    expect(amounts.length).toBeGreaterThanOrEqual(3); // 少なくとも3つの金額が表示される
  });

  test('不動産データがある場合に正しく表示される', () => {
    render(<InvestmentView data={mockData} />);
    
    // 「不動産」タブをクリック（ボタン要素に限定）
    fireEvent.click(screen.getByRole('button', { name: '不動産' }));
    
    // 不動産詳細セクションが表示される
    expect(screen.getByText('不動産投資詳細')).toBeInTheDocument();
    
    // 不動産データが表示される
    expect(screen.getByText('家賃収入')).toBeInTheDocument();
    
    // 金額が正しく表示される（getByTextではなくgetAllByTextを使用）
    const amountElements = screen.getAllByText(/￥80,000/);
    expect(amountElements.length).toBeGreaterThan(0); // 少なくとも1つ存在する
    
    // 家賃収入の行に金額が表示されていることを確認する
    const rentRow = screen.getByText('家賃収入').closest('tr');
    expect(rentRow).toHaveTextContent('￥80,000');
  });
  
  test('概要タブでポートフォリオ分布が正しく表示される', () => {
    render(<InvestmentView data={mockData} />);
    
    // 初期状態では「概要」タブが表示される
    expect(screen.getByText('投資ポートフォリオ概要')).toBeInTheDocument();
    
    // 総投資額が正しく表示される（全角円記号を使用）
    expect(screen.getByText(/￥102,000/)).toBeInTheDocument();
    
    // 株式の合計金額（全角円記号を使用）
    expect(screen.getByText(/￥20,000/)).toBeInTheDocument();
    
    // 投資信託の合計金額（全角円記号を使用）
    expect(screen.getByText(/￥2,000/)).toBeInTheDocument();
    
    // 不動産の合計金額（全角円記号を使用）
    expect(screen.getByText(/￥80,000/)).toBeInTheDocument();
    
    // ポートフォリオ分布の円グラフが表示される
    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    
    // 円グラフが正しいデータで表示されていることを確認
    const chartData = JSON.parse(screen.getByTestId('mock-pie-chart').getAttribute('data-chart-data'));
    expect(chartData.labels).toContain('株式');
    expect(chartData.labels).toContain('投資信託');
    expect(chartData.labels).toContain('不動産');
  });
  
  test('推移タブで月次推移グラフが正しく表示される', () => {
    render(<InvestmentView data={mockData} />);
    
    // 「推移」タブをクリック
    fireEvent.click(screen.getByText('推移'));
    
    // 推移セクションが表示される
    expect(screen.getByText('投資額の月次推移')).toBeInTheDocument();
    
    // 折れ線グラフが表示される
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    
    // グラフが正しいデータで表示されていることを確認
    const chartData = JSON.parse(screen.getByTestId('mock-line-chart').getAttribute('data-chart-data'));
    expect(chartData.labels).toContain('2023/01');
    expect(chartData.labels).toContain('2023/02');
    
    // データセットに株式、投資信託、不動産、合計の4つが含まれていることを確認
    const datasetLabels = chartData.datasets.map(ds => ds.label);
    expect(datasetLabels).toContain('株式');
    expect(datasetLabels).toContain('投資信託');
    expect(datasetLabels).toContain('不動産');
    expect(datasetLabels).toContain('合計');
  });
  
  test('タブ切り替えが正しく動作する', () => {
    render(<InvestmentView data={mockData} />);
    
    // 初期状態では「概要」タブの内容が表示される
    expect(screen.getByText('投資ポートフォリオ概要')).toBeInTheDocument();
    expect(screen.queryByText('株式・投資信託詳細')).not.toBeInTheDocument();
    
    // 「株式・投資信託」タブをクリック
    fireEvent.click(screen.getByText('株式・投資信託'));
    
    // 「株式・投資信託」タブの内容が表示される
    expect(screen.queryByText('投資ポートフォリオ概要')).not.toBeInTheDocument();
    expect(screen.getByText('株式・投資信託詳細')).toBeInTheDocument();
    
    // 「不動産」タブをクリック（ボタン要素に限定）
    fireEvent.click(screen.getByRole('button', { name: '不動産' }));
    
    // 「不動産」タブの内容が表示される
    expect(screen.queryByText('株式・投資信託詳細')).not.toBeInTheDocument();
    expect(screen.getByText('不動産投資詳細')).toBeInTheDocument();
    
    // 「推移」タブをクリック
    fireEvent.click(screen.getByText('推移'));
    
    // 「推移」タブの内容が表示される
    expect(screen.queryByText('不動産投資詳細')).not.toBeInTheDocument();
    expect(screen.getByText('投資額の月次推移')).toBeInTheDocument();
    
    // 「概要」タブをクリックして戻る
    fireEvent.click(screen.getByText('概要'));
    
    // 「概要」タブの内容が再び表示される
    expect(screen.queryByText('投資額の月次推移')).not.toBeInTheDocument();
    expect(screen.getByText('投資ポートフォリオ概要')).toBeInTheDocument();
  });

  test('dataがundefinedの場合に正しくレンダリングされる', () => {
    // dataを省略して呼び出し（デフォルト値の[]が使われる）
    render(<InvestmentView />);
    
    // タブが表示されていることを確認
    expect(screen.getByText('概要')).toBeInTheDocument();
    
    // データがない旨のメッセージは表示されない（代わりに金額が0と表示される）
    expect(screen.getByText('総投資額')).toBeInTheDocument();
    // 全角円記号を使用
    expect(screen.getAllByText(/￥0/)).toHaveLength(4);
  });
});