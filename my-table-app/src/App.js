import React, { useState, useEffect } from 'react';
import AggregatedTable from './components/AggregatedTable';
import Sidebar from './components/Sidebar';
import Charts from './components/Charts';
import DataTable from './components/DataTable';
import MonthlyTrendChart from './components/MonthlyTrendChart'; 
import MonthlyTrendTable from './components/MonthlyTrendTable';
import BalanceView from './components/BalanceView';
import CategoryQuadrantView from './components/CategoryQuadrantView'; // カテゴリ四分法ビューをインポート
import CategoryPieChart from './components/CategoryPieChart'; // 大項目・中項目表示用ドーナツグラフ
import { handleFiles } from './components/fileHandlers';
import { chartOptions } from './config/chartOptions';
import { createMonthlyTrendData } from './utils/monthlyTrendUtils';
import calculateCategoryTotals from './utils/calculateCategoryTotals';
import { filterData } from './utils/sortData';
import { splitDataBySign, formatCategoryData } from './utils';
import PropTypes from 'prop-types';
import CategoryDetailsTable from './components/CategoryDetailsTable';
import InvestmentView from './components/InvestmentView'; // 投資分析ビューをインポート
import './App.css';

// 型定義
interface HoverInfo {
  label: string;
  subtotal: number;
}
interface CategoryInfo {
  label: string;
}

// 安全な月次データの初期状態
const EMPTY_MONTHLY_DATA = {
  labels: [],
  datasets: []
};

const App = ({ initialData = [] }) => {
  const [data, setData] = useState([]);
  const [positiveChartData, setPositiveChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  });
  const [negativeChartData, setNegativeChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  });
  const [monthlyTrendData, setMonthlyTrendData] = useState(EMPTY_MONTHLY_DATA);
  const [positiveTotal, setPositiveTotal] = useState(0);
  const [negativeTotal, setNegativeTotal] = useState(0);
  const [view, setView] = useState('dashboard'); // 初期ビューを'dashboard'に変更
  const [filteredData, setFilteredData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null); // ホバー情報を保持する状態
  const [aggregatedData, setAggregatedData] = useState({});
  const [categoryTotals, setCategoryTotals] = useState({});
  const [filters, setFilters] = useState({ excludeTransfers: true }); // 振替除外をデフォルトに設定
  const [initialDateRange, setInitialDateRange] = useState({ startDate: '', endDate: '' }); // 初期日付範囲を保存
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFilteredData, setCategoryFilteredData] = useState([]);
  const [prevFilters, setPrevFilters] = useState({}); // 前回のフィルタ状態を保存
  const [chartKey, setChartKey] = useState(0); // チャートの強制リロード用キー
  const [dataProcessing, setDataProcessing] = useState(false); // データ処理中フラグ
  const [monthlyViewMode, setMonthlyViewMode] = useState('chart'); // 月次推移の表示モード（chart or table）
  const [showPrediction, setShowPrediction] = useState(false); // 予測表示のオン/オフ状態
  const [forecastPeriods, setForecastPeriods] = useState(3); // 予測期間（デフォルト3ヶ月）
  const [predictionMethod, setPredictionMethod] = useState('seasonal_ma'); // 予測手法（デフォルトは季節性移動平均）

  // ファイルハンドラをラップする関数を作成
  const handleFileUpload = (files) => {
    setDataProcessing(true); // データ処理開始
    handleFiles(files, {
      setData,
      setPositiveChartData,
      setNegativeChartData,
      setPositiveTotal,
      setNegativeTotal,
      setAggregatedData,
      setCategoryTotals,
      setMonthlyTrendData,
      setIsLoading: setDataProcessing, // 処理状態を共有
      // 日付範囲を設定する関数を追加
      setDateRange: (dateRange) => {
        // 初期日付範囲として保存
        setInitialDateRange(dateRange);
        
        // 既存のexcludeTransfersフィルターを保持しつつ日付範囲を追加
        setFilters(prev => ({
          ...prev,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }));
        console.log('日付フィルターを自動設定しました:', dateRange);
      }
    });
  };

  const handleHover = (info) => {
    setHoverInfo(info);
  };

  const handleClick = (categoryInfo) => {
    if (categoryInfo && categoryInfo.label) {
      // 項目がクリックされた場合、選択カテゴリとして設定
      setSelectedCategory(categoryInfo);
      
      // カテゴリでデータをフィルタリング
      const filtered = data.filter(item => item['大項目'] === categoryInfo.label);
      setCategoryFilteredData(filtered);
    } else {
      // クリア処理
      setSelectedCategory(null);
      setCategoryFilteredData([]);
    }
  };

  // フィルタが変更されたときの処理
  const handleFilterChange = (filterKey, value) => {
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [filterKey]: value
      };
      
      return newFilters;
    });
  };

  // データとフィルタの変更を検知してデータ更新
  useEffect(() => {
    if (!data || data.length === 0) {
      return; // データがない場合は何もしない
    }

    const newFilteredData = filterData(data, filters);
    setFilteredData(newFilteredData);
    
    // フィルタの変更を検出
    const filtersChanged = 
      JSON.stringify(prevFilters) !== JSON.stringify(filters);
    
    // フィルタが変更された場合のみチャートをリロード
    if (filtersChanged) {
      setPrevFilters(filters);
      setChartKey(prevKey => prevKey + 1); // キーを変更して強制リロード

      // フィルタリングされたデータから新しいチャートデータを生成
      const chartData = splitDataBySign(newFilteredData);
      
      // 円グラフデータを更新
      setPositiveChartData(chartData.positiveData);
      setNegativeChartData(chartData.negativeData);
      setPositiveTotal(chartData.positiveTotal);
      setNegativeTotal(chartData.negativeTotal);
    }
    
    calculateCategoryTotals(newFilteredData)
      .then(totals => setCategoryTotals(totals))
      .catch(error => console.error('カテゴリ合計の計算中にエラーが発生しました:', error));
  }, [data, filters]);

  // 月次推移データの更新（データまたはフィルタ変更時）
  useEffect(() => {
    // データ処理中またはデータが空の場合は処理しない
    if (dataProcessing || !data || data.length === 0) {
      return;
    }

    try {
      // 月次推移データを生成
      const filteredData = filterData(data, filters);
      
      console.log('月次推移データの生成を開始: フィルタ後のデータ数', filteredData.length);
      
      // フィルタ後もデータがあるか確認
      if (filteredData && filteredData.length > 0) {
        // 新しい関数を使用して月次推移データを生成
        const trendData = createMonthlyTrendData(filteredData, {
          dateKey: '日付',
          categoryKey: '大項目',
          amountKey: '金額（円）',
          maxCategories: 5,
          debug: true
        });
        
        console.log('生成された月次推移データ:', 
                    'ラベル数:', trendData.labels?.length || 0, 
                    'データセット数:', trendData.datasets?.length || 0);
        
        // データを状態にセット
        setMonthlyTrendData(trendData);
        
      } else {
        // フィルタ後データがない場合
        console.log('フィルタ後のデータがありません');
        setMonthlyTrendData(EMPTY_MONTHLY_DATA);
      }
    } catch (error) {
      console.error('月次推移データ生成中にエラーが発生しました:', error);
      // エラーが発生した場合は空のデータをセット
      setMonthlyTrendData(EMPTY_MONTHLY_DATA);
    }
  }, [data, filters, dataProcessing]);

  // コンポーネントがマウントされた時に初期データが存在する場合は使用
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      // 初期データを設定
      setData(initialData);
      // 初期データをフィルタリングデータとしても設定
      setFilteredData(initialData);

      // 初期データから月次推移データを安全に生成
      try {
        // 新しい関数を使用
        const initialTrendData = createMonthlyTrendData(initialData, {
          dateKey: '日付',
          categoryKey: '大項目',
          amountKey: '金額（円）',
          maxCategories: 5,
          debug: true
        });
        
        // 有効なデータかチェック
        if (initialTrendData && initialTrendData.labels && initialTrendData.datasets && 
            initialTrendData.labels.length > 0 && initialTrendData.datasets.length > 0) {
          setMonthlyTrendData(initialTrendData);
        } else {
          setMonthlyTrendData(EMPTY_MONTHLY_DATA);
        }
      } catch (error) {
        console.error('初期月次推移データ生成中にエラーが発生しました:', error);
        setMonthlyTrendData(EMPTY_MONTHLY_DATA);
      }
    }
  }, [initialData]);

  return (
    <div className="app-container">
      <Sidebar 
        setView={setView} 
        handleFiles={handleFileUpload} 
        currentView={view} 
        filters={filters}
        onFilterChange={handleFilterChange}
        initialDateRange={initialDateRange}
      />
      <main className="main-content">
        <div className="page-header">
          <h1>家計簿分析</h1>
          <div className="filters-container">
            <div className="filter-input">
              <label htmlFor="category-filter">カテゴリ:</label>
              <input 
                id="category-filter"
                type="text" 
                placeholder="大項目でフィルター" 
                onChange={(e) => handleFilterChange('大項目', e.target.value)}
                className="modern-input"
              />
            </div>
          </div>
        </div>
        
        <div className="data-summary-card">
          <div className="data-summary-item">
            <span className="data-summary-label">フィルタリングされたデータ:</span> 
            <span className="data-summary-value" data-testid="filtered-data-count">{filteredData.length}</span>
            <span className="data-summary-unit">件</span>
          </div>
          <div className="data-summary-item">
            <span className="data-summary-label">カテゴリ別合計:</span> 
            <span className="data-summary-value" data-testid="category-count">{Object.keys(categoryTotals).length}</span>
            <span className="data-summary-unit">カテゴリ</span>
          </div>
          <div className="data-summary-item">
            <span className="data-summary-label">総データ件数:</span> 
            <span className="data-summary-value" data-testid="total-data-count">{data.length}</span>
            <span className="data-summary-unit">件</span>
          </div>
        </div>
        
        <div className="content-container">
          {view === 'dashboard' && (
            <div className="dashboard-section" data-testid="dashboard-view">
              {data.length ? (
                <>
                  {/* 収支バランス（B/S）可視化 */}
                  <div className="dashboard-bs-section" style={{ marginBottom: 32 }}>
                    <h2 className="section-title">B/S（バランスシート）</h2>
                    <BalanceView 
                      positiveTotal={positiveTotal}
                      negativeTotal={negativeTotal}
                      positiveData={positiveChartData}
                      negativeData={negativeChartData}
                    />
                  </div>

                  {/* 収支の可視化（既存） */}
                  <div className="dashboard-charts">
                    <h2 className="section-title">収支の可視化</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%', padding: '16px' }}>
                      {/* 収入ドーナツグラフ（大項目と中項目） */}
                      <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        padding: '20px',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <h2 style={{
                          fontSize: '1.5rem',
                          fontWeight: 600,
                          color: '#333',
                          margin: '0 0 16px 0',
                          padding: '0 0 12px 0',
                          borderBottom: '1px solid #f0f0f0',
                          width: '100%',
                          textAlign: 'center'
                        }}>
                          収入: <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>¥{positiveTotal.toLocaleString()}</span>
                        </h2>
                        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                          <CategoryPieChart 
                            data={formatCategoryData(filteredData, true)} 
                            key={`positive-categories-${chartKey}`}
                          />
                        </div>
                      </div>

                      {/* 支出ドーナツグラフ（大項目と中項目） */}
                      <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        padding: '20px',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <h2 style={{
                          fontSize: '1.5rem',
                          fontWeight: 600,
                          color: '#333',
                          margin: '0 0 16px 0',
                          padding: '0 0 12px 0',
                          borderBottom: '1px solid #f0f0f0',
                          width: '100%',
                          textAlign: 'center'
                        }}>
                          支出: <span style={{ fontWeight: 'bold', color: '#F44336' }}>¥{negativeTotal.toLocaleString()}</span>
                        </h2>
                        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                          <CategoryPieChart 
                            data={formatCategoryData(filteredData, false)} 
                            key={`negative-categories-${chartKey}`}
                          />
                        </div>
                      </div>
                    </div>

                    {hoverInfo && hoverInfo.subtotal !== undefined && (
                      <div className="hover-info-card">
                        <h3>詳細情報</h3>
                        <p><strong>項目名:</strong> {hoverInfo.label}</p>
                        <p><strong>小計:</strong> ¥{hoverInfo.subtotal.toLocaleString()}</p>
                        <p className="hover-info-hint">クリックで詳細を表示</p>
                      </div>
                    )}
                  </div>

                  {/* P/L（損益計算書的な支出構造）可視化 */}
                  <div className="dashboard-pl-section" style={{ marginTop: 32 }}>
                    <h2 className="section-title">P/L（支出構造の四分法）</h2>
                    <CategoryQuadrantView 
                      data={filteredData}
                      negativeTotal={negativeTotal}
                    />
                  </div>

                  <div className="dashboard-tables">
                    <h2 className="section-title">カテゴリ別集計</h2>
                    <AggregatedTable aggregatedData={aggregatedData} />
                  </div>
                  
                  {/* 選択したカテゴリの詳細表示 */}
                  {selectedCategory && (
                    <div className="dashboard-category-details">
                      <CategoryDetailsTable 
                        data={categoryFilteredData}
                        category={selectedCategory ? selectedCategory.label : ''}
                        title={`「${selectedCategory ? selectedCategory.label : ''}」の明細`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <p>データがありません</p>
                  <p className="empty-state-hint">CSVファイルをアップロードしてください</p>
                </div>
              )}
            </div>
          )}
          
          {view === 'rawdata' && (
            <div className="rawdata-section" data-testid="rawdata-view">
              {data.length ? (
                <div>
                  <h2 className="section-title">CSVの生データ</h2>
                  <DataTable data={filteredData} />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📄</div>
                  <p>データがありません</p>
                  <p className="empty-state-hint">CSVファイルをアップロードしてください</p>
                </div>
              )}
            </div>
          )}

          {view === 'monthlytrend' && (
            <div className="monthlytrend-section" data-testid="monthlytrend-view">
              {data.length ? (
                <div>
                  <h2 className="section-title">項目別月次推移</h2>
                  <div className="view-controls">
                    <div className="view-mode-toggle">
                      <button 
                        className={`toggle-button ${monthlyViewMode === 'chart' ? 'active' : ''}`}
                        onClick={() => setMonthlyViewMode('chart')}
                      >
                        グラフ表示
                      </button>
                      <button 
                        className={`toggle-button ${monthlyViewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setMonthlyViewMode('table')}
                      >
                        表表示
                      </button>
                    </div>
                    
                    {/* 予測表示のトグルボタン - グラフ表示の場合のみ表示 */}
                    {monthlyViewMode === 'chart' && monthlyTrendData.labels && monthlyTrendData.labels.length >= 3 && (
                      <div className="prediction-toggle">
                        <label className="prediction-toggle-label">
                          <input 
                            type="checkbox" 
                            checked={showPrediction} 
                            onChange={(e) => setShowPrediction(e.target.checked)} 
                          />
                          将来の予測を表示
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {/* 予測設定コントロール - 予測表示が有効な場合のみ表示 */}
                  {monthlyViewMode === 'chart' && showPrediction && (
                    <div className="prediction-controls">
                      <div className="prediction-control-row">
                        <div className="prediction-control-group">
                          <span className="prediction-control-label">予測期間:</span>
                          <div className="prediction-period-options">
                            <button 
                              className={`period-option ${forecastPeriods === 1 ? 'active' : ''}`}
                              onClick={() => setForecastPeriods(1)}
                            >
                              1ヶ月先
                            </button>
                            <button 
                              className={`period-option ${forecastPeriods === 2 ? 'active' : ''}`}
                              onClick={() => setForecastPeriods(2)}
                            >
                              2ヶ月先
                            </button>
                            <button 
                              className={`period-option ${forecastPeriods === 3 ? 'active' : ''}`}
                              onClick={() => setForecastPeriods(3)}
                            >
                              3ヶ月先
                            </button>
                          </div>
                        </div>
                        <div className="prediction-control-group">
                          <span className="prediction-control-label">予測手法:</span>
                          <select 
                            className="prediction-select"
                            value={predictionMethod}
                            onChange={(e) => setPredictionMethod(e.target.value)}
                          >
                            <option value="auto">自動選択</option>
                            <option value="arima">ARIMA</option>
                            <option value="exponential">指数平滑法</option>
                            <option value="seasonal_ma">季節性調整付き移動平均</option>
                          </select>
                          <div className="prediction-info-tooltip">
                            <div className="tooltip-icon">?</div>
                            <div className="tooltip-content">
                              <strong>自動選択</strong>: データに最適な予測手法を自動選択<br/>
                              <strong>ARIMA</strong>: 自己回帰和分移動平均モデル<br/>
                              <strong>指数平滑法</strong>: トレンドと季節性を加味した予測<br/>
                              <strong>季節性調整付き移動平均</strong>: 季節変動を考慮した移動平均予測
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="trend-chart-container">
                    {dataProcessing ? (
                      <div className="loading-indicator">データを処理中...</div>
                    ) : (
                      <>
                        {monthlyViewMode === 'chart' ? (
                          <MonthlyTrendChart 
                            key={`trend-chart-${chartKey}-${showPrediction ? 'with-prediction' : 'no-prediction'}-${forecastPeriods}-${predictionMethod}`}
                            trendData={monthlyTrendData}
                            options={{
                              plugins: {
                                title: {
                                  display: true,
                                  text: '主要カテゴリの月次推移',
                                  font: { size: 16, weight: 'bold' }
                                }
                              }
                            }}
                            showPrediction={showPrediction}
                            forecastPeriods={forecastPeriods}
                            predictionMethod={predictionMethod}
                            showSavingsRate={false}
                          />
                        ) : (
                          <MonthlyTrendTable 
                            key={`trend-table-${chartKey}-${showPrediction ? 'with-prediction' : 'no-prediction'}`}
                            trendData={monthlyTrendData}
                            showPrediction={showPrediction}
                            showSavingsRate={false}
                            showQuadrantSummary={false}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="trend-explanation">
                    <h3>データの見方</h3>
                    <p>このデータは各カテゴリの月別推移を表示しています。金額の大きい上位5カテゴリを自動で選択して表示します。</p>
                    <p>・グラフ表示: 各カテゴリの推移を折れ線グラフで視覚化</p>
                    <p>・表表示: カテゴリ別・月別の金額を一覧表として閲覧可能</p>
                    <p>・表の行をクリックすると、そのカテゴリを強調表示できます</p>
                    {monthlyViewMode === 'chart' && (
                      <p>・予測表示: 過去のトレンドに基づき翌月の予測値を点線で表示します</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📈</div>
                  <p>データがありません</p>
                  <p className="empty-state-hint">CSVファイルをアップロードしてください</p>
                </div>
              )}
            </div>
          )}
          
          {/* 収支バランスビューを追加 */}
          {view === 'balance' && (
            <div className="balance-section" data-testid="balance-view">
              {data.length ? (
                <div>
                  <BalanceView 
                    positiveTotal={positiveTotal}
                    negativeTotal={negativeTotal}
                    positiveData={positiveChartData}
                    negativeData={negativeChartData}
                  />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <p>データがありません</p>
                  <p className="empty-state-hint">CSVファイルをアップロードしてください</p>
                </div>
              )}
            </div>
          )}

          {/* カテゴリ四分法ビューを追加 */}
          {view === 'categoryQuadrant' && (
            <div className="category-quadrant-section" data-testid="category-quadrant-view">
              {data.length ? (
                <div>
                  <CategoryQuadrantView 
                    data={filteredData}
                    negativeTotal={negativeTotal}
                  />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <p>データがありません</p>
                  <p className="empty-state-hint">CSVファイルをアップロードしてください</p>
                </div>
              )}
            </div>
          )}

          {view === 'investment' && (
            <div className="investment-section" data-testid="investment-view">
              {data.length ? (
                <div>
                  <h2 className="section-title">投資分析（株式・投資信託・不動産）</h2>
                  <InvestmentView data={filteredData} />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <p>データがありません</p>
                  <p className="empty-state-hint">CSVファイルをアップロードしてください</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// PropTypesの検証を追加
App.propTypes = {
  initialData: PropTypes.array
};

// テスト用にセッター関数をエクスポート - process.envを使わない形式に変更
App.__testExports = {
  setData: null // 実際のコンポーネントレンダリング時に設定される
};

export default App;