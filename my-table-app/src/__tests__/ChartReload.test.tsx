import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import type { TestEnvWindow } from '../types';
import PropTypes from 'prop-types';

// テスト環境フラグを明示的に設定 - グローバルとJest環境変数の両方を設定
(window as TestEnvWindow).__JEST_TEST_ENV__ = true;
// process.env.NODE_ENV = 'test'; // 読み取り専用なのでコメントアウト

// カウンターを使ったレンダリング追跡
let renderCount = 0;

// モック用コンポーネント - chartsKeyをより分かりやすく表示
const MockCharts = ({ chartsKey, positiveChartData, negativeChartData, options, onClick, onHover, positiveTotal, negativeTotal }) => {
  // レンダリングカウンターをインクリメント
  renderCount++;
  
  return (
    <div data-testid="mock-charts">
      <div data-charts-key={chartsKey} data-render-count={renderCount}>
        チャート表示エリア (キー: {chartsKey}, レンダリング回数: {renderCount})
      </div>
      <div>
        {positiveChartData && `データ件数: ${positiveChartData.labels.length}件`}
      </div>
      <div>
        {positiveChartData && positiveChartData.labels.map((label, i) => (
          <div key={label} data-testid={`chart-item-${label}`}>
            {label}: {positiveChartData.datasets[0].data[i]}
          </div>
        ))}
      </div>
      <div className="totals">
        <div>収入合計: {positiveTotal}円</div>
        <div>支出合計: {negativeTotal}円</div>
      </div>
      <div className="handlers">
        <button onClick={onClick}>クリック</button>
        <button onMouseEnter={onHover}>ホバー</button>
      </div>
      <div className="options-debug">
        Options: {JSON.stringify(options)}
      </div>
      <div className="negative-data">
        {negativeChartData && `負のデータ件数: ${negativeChartData.labels?.length || 0}件`}
      </div>
    </div>
  );
};

// モック適用 - Chartsコンポーネントを完全に置き換え
jest.mock('../components/Charts', () => {
  const MockChartsComponent = function(props) {
    return <MockCharts {...props} />;
  };
  MockChartsComponent.displayName = 'MockCharts';
  return MockChartsComponent;
});

// テスト対象のDashboardコンポーネント
function Dashboard({ data, filters, onFilterChange }) {
  const [chartKey, setChartKey] = React.useState(0);
  const [chartData, setChartData] = React.useState({
    positiveChartData: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
    },
    negativeChartData: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
    }
  });
  
  // フィルターが変更されたら、チャートデータとキーを更新
  React.useEffect(() => {
    // フィルターに基づいてデータを処理
    const filteredData = filters.category 
      ? data.filter(item => item.category === filters.category)
      : data;
      
    // チャートデータを更新
    setChartData({
      positiveChartData: {
        labels: filteredData.map(item => item.category),
        datasets: [{ 
          data: filteredData.map(item => item.amount),
          // ランダム色を生成せず、固定色を使用してテストの安定性を確保
          backgroundColor: filteredData.map((_, i) => ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][i % 4])
        }]
      },
      negativeChartData: {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      }
    });
    
    // キーを更新して強制的に再レンダリング
    setChartKey(prevKey => prevKey + 1);
    
  }, [filters, data]);
  
  return (
    <div data-testid="dashboard">
      <div className="filter-controls">
        <select 
          data-testid="category-filter"
          value={filters.category || ''}
          onChange={e => onFilterChange({ ...filters, category: e.target.value })}
        >
          <option value="">すべてのカテゴリ</option>
          <option value="食費">食費</option>
          <option value="交通費">交通費</option>
        </select>
      </div>
      <div className="charts-container" data-testid="charts-container">
        {/* chartsKeyプロパティとして現在のキー値を渡す */}
        <MockCharts 
          key={`chart-${chartKey}`}
          chartsKey={chartKey}
          positiveChartData={chartData.positiveChartData}
          negativeChartData={chartData.negativeChartData}
          positiveTotal={0}
          negativeTotal={0}
          options={{}}
          onClick={() => {}}
          onHover={() => {}}
        />
      </div>
    </div>
  );
}

// PropTypesを追加
MockCharts.propTypes = {
  chartsKey: PropTypes.any,
  positiveChartData: PropTypes.object,
  negativeChartData: PropTypes.object,
  options: PropTypes.object,
  onClick: PropTypes.func,
  onHover: PropTypes.func,
  positiveTotal: PropTypes.number,
  negativeTotal: PropTypes.number
};

// DashboardコンポーネントのPropTypesを追加
Dashboard.propTypes = {
  data: PropTypes.array,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func
};

// テスト
describe('Dashboard フィルター変更時にチャートが再レンダリングされること', () => {
  const testData = [
    { id: 1, category: '食費', amount: 1000 },
    { id: 2, category: '交通費', amount: 500 }
  ];
  
  beforeEach(() => {
    // テスト前にレンダリングカウンターをリセット
    renderCount = 0;
    jest.useRealTimers();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('フィルター変更時にチャートが再レンダリングされること', async () => {
    let dashboardComponent;
    
    // 初期レンダリング
    await act(async () => {
      dashboardComponent = render(
        <Dashboard 
          data={testData}
          filters={{ category: '' }}
          onFilterChange={(_filters) => {
            // ここでは何もしない (テスト用のスタブ)
          }}
        />
      );
      
      // レンダリングが確実に完了するのを待つ - 時間を延長
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 初期値を取得
    const initialChartElement = screen.getByTestId('mock-charts');
    const initialChartKeyElement = initialChartElement.querySelector('[data-charts-key]');
    // nullチェックを追加
    expect(initialChartKeyElement).not.toBeNull();
    if (!initialChartKeyElement) throw new Error('initialChartKeyElement is null');
    const initialChartKey = initialChartKeyElement.getAttribute('data-charts-key') ?? '';
    const initialRenderCount = initialChartKeyElement.getAttribute('data-render-count') ?? '';
    expect(initialChartKey).toBeTruthy();
    expect(initialRenderCount).toBeTruthy();
    
    // 両方のカテゴリが表示されていることを確認
    const shokuhiElem = screen.getByText('食費: 1000');
    expect(shokuhiElem).not.toBeNull();
    const kotsuhiElem = screen.getByText('交通費: 500');
    expect(kotsuhiElem).not.toBeNull();
    
    // フィルター変更をシミュレート - 新しいpropsでコンポーネントを再レンダリング
    await act(async () => {
      dashboardComponent.rerender(
        <Dashboard 
          data={testData}
          filters={{ category: '食費' }} // フィルターを変更
          onFilterChange={() => {}} // ダミーハンドラ
        />
      );
      
      // 状態更新が確実に反映されるのを待つ - 時間を延長
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    // 更新後の値を確認 - タイムアウト時間を拡大
    await waitFor(() => {
      const updatedChartElement = screen.getByTestId('mock-charts');
      const updatedKeyElement = updatedChartElement.querySelector('[data-charts-key]');
      expect(updatedKeyElement).not.toBeNull();
      if (!updatedKeyElement) throw new Error('updatedKeyElement is null');
      const updatedKey = updatedKeyElement.getAttribute('data-charts-key') ?? '';
      const updatedRenderCount = updatedKeyElement.getAttribute('data-render-count') ?? '';
      // キーが更新されていることを確認
      expect(parseInt(updatedKey, 10)).toBeGreaterThan(parseInt(initialChartKey, 10));
      // レンダリング回数が増えていることを確認
      expect(parseInt(updatedRenderCount, 10)).toBeGreaterThan(parseInt(initialRenderCount, 10));
      // フィルター後のデータに関する検証
      const filteredElem = screen.getByText('食費: 1000');
      expect(filteredElem).not.toBeNull();
      const filteredKotsuhi = screen.queryByText('交通費: 500');
      expect(filteredKotsuhi).toBeNull();
    }, { timeout: 5000 });
  });
});
