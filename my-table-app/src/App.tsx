import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppProps, ChartData, TrendData, HouseholdRecord } from './types';
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
import { filterData } from './utils/sortData';
import { splitDataBySign } from './utils';
import CategoryDetailsTable from './components/CategoryDetailsTable';
import InvestmentView from './components/InvestmentView'; // 投資分析ビューをインポート
import './App.css';

// 安全な月次データの初期状態
const EMPTY_MONTHLY_DATA: TrendData = {
  labels: [],
  datasets: []
};

const App: React.FC<AppProps> = ({ initialData = [] }) => {
  // HouseholdRecord[]型で明示
  const [data, setData] = useState<HouseholdRecord[]>([]);
  const [positiveChartData, setPositiveChartData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: '',
      hoverBackgroundColor: ''
    }]
  });
  const [negativeChartData, setNegativeChartData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: '',
      hoverBackgroundColor: ''
    }]
  });
  const [monthlyTrendData, setMonthlyTrendData] = useState<TrendData>(EMPTY_MONTHLY_DATA);
  const [positiveTotal, setPositiveTotal] = useState<number>(0);
  const [negativeTotal, setNegativeTotal] = useState<number>(0);
  const [view, setView] = useState<string>('dashboard');
  const [filteredData, setFilteredData] = useState<HouseholdRecord[]>([]); // eslint-disable-line no-undef
  const [hoverInfo, setHoverInfo] = useState<{ label: string; subtotal: number } | null>(null); // eslint-disable-line no-undef
  const [aggregatedData, setAggregatedData] = useState<{ [field: string]: unknown }[]>([]); // eslint-disable-line no-undef
  const [filters, setFilters] = useState<{ [field: string]: unknown }>({ excludeTransfers: true }); // eslint-disable-line no-undef
  const [initialDateRange, setInitialDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' }); // eslint-disable-line no-undef
  const [selectedCategory, setSelectedCategory] = useState<{ label: string } | null>(null); // eslint-disable-line no-undef
  const [categoryFilteredData, setCategoryFilteredData] = useState<HouseholdRecord[]>([]); // eslint-disable-line no-undef
  const [prevFilters, setPrevFilters] = useState<{ [field: string]: unknown }>({}); // eslint-disable-line no-undef
  const [chartKey, setChartKey] = useState<number>(0);
  const [dataProcessing, setDataProcessing] = useState<boolean>(false);
  const [monthlyViewMode, setMonthlyViewMode] = useState<'chart' | 'table'>('chart');
  const [showPrediction, setShowPrediction] = useState<boolean>(false);
  const [forecastPeriods, setForecastPeriods] = useState<number>(3);
  const [predictionMethod, setPredictionMethod] = useState<string>('seasonal_ma');

  // ファイルハンドラをラップする関数 - useCallbackで最適化
  const handleFileUpload = useCallback((files: FileList) => {
    setDataProcessing(true); // データ処理開始
    handleFiles(files, {
      setData: (data: Record<string, unknown>[]) => setData(data as HouseholdRecord[]),
      setPositiveChartData: (data: ChartData) => setPositiveChartData(data),
      setNegativeChartData: (data: ChartData) => setNegativeChartData(data),
      setPositiveTotal,
      setNegativeTotal,
      setAggregatedData: (data) => setAggregatedData(data as { [key: string]: unknown }[]), // eslint-disable-line no-undef
      setMonthlyTrendData: (data: TrendData) => setMonthlyTrendData(data),
      setIsLoading: setDataProcessing, // 処理状態を共有
      // 日付範囲を設定する関数を追加
      setDateRange: (dateRange: { startDate: string; endDate: string }) => {
        setInitialDateRange(dateRange);
        setFilters(prev => ({
          ...prev,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }));
        console.log('日付フィルターを自動設定しました:', dateRange);
      }
    });
  }, []);

  // ホバーイベントハンドラ - useCallbackで最適化
  const handleHover = useCallback((info) => {
    setHoverInfo(info);
  }, []);

  // クリックイベントハンドラ - useCallbackで最適化
  const handleClick = useCallback((categoryInfo) => {
    if (categoryInfo && categoryInfo.label) {
      // 項目がクリックされた場合、選択カテゴリとして設定
      setSelectedCategory(categoryInfo);
      
      // カテゴリでデータをフィルタリング
      setFilteredData(prevData => {
        const filtered = prevData.filter(item => item['大項目'] === categoryInfo.label);
        setCategoryFilteredData(filtered);
        return prevData;
      });
    } else {
      // クリア処理
      setSelectedCategory(null);
      setCategoryFilteredData([]);
    }
  }, []);

  // フィルタが変更されたときの処理 - useCallbackで最適化
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [filterKey]: value
      };
      
      return newFilters;
    });
  }, []);

  // ビュー切り替え - useCallbackで最適化
  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  // 月次推移表示モード切り替え - useCallbackで最適化
  const handleMonthlyViewModeChange = useCallback((mode) => {
    setMonthlyViewMode(mode);
  }, []);

  // 予測表示切り替え - useCallbackで最適化
  const handlePredictionToggle = useCallback(() => {
    setShowPrediction(prev => !prev);
  }, []);

  // 予測期間変更 - useCallbackで最適化
  const handleForecastPeriodsChange = useCallback((periods) => {
    setForecastPeriods(Number(periods));
  }, []);

  // 予測手法変更 - useCallbackで最適化
  const handlePredictionMethodChange = useCallback((method) => {
    setPredictionMethod(method);
  }, []);

  // データとフィルタの変更を検知してデータ更新
  useEffect(() => {
    if (!data || data.length === 0) {
      return; // データがない場合は何もしない
    }

    const newFilteredData = filterData(data, filters);
    setFilteredData(newFilteredData);
    
    const filtersChanged = 
      JSON.stringify(prevFilters) !== JSON.stringify(filters);
    
    if (filtersChanged) {
      setPrevFilters(filters);
      setChartKey(prevKey => prevKey + 1);

      const chartData = splitDataBySign(newFilteredData);
      // datasetsのdataをnumber[]に変換し、backgroundColor等もstring型に正規化
      const fixChartData = (data: { labels: string[]; datasets: { data: unknown[]; backgroundColor?: string | string[]; hoverBackgroundColor?: string | string[]; label?: string; [key: string]: unknown; }[] }): ChartData => ({
        labels: data.labels,
        datasets: data.datasets.map((ds) => ({
          ...ds,
          label: typeof ds.label === 'string' ? ds.label : '',
          data: (ds.data as unknown[]).map(Number),
          backgroundColor: Array.isArray(ds.backgroundColor)
            ? (ds.backgroundColor[0] ?? '')
            : (typeof ds.backgroundColor === 'string' ? ds.backgroundColor : ''),
          hoverBackgroundColor: Array.isArray(ds.hoverBackgroundColor)
            ? (ds.hoverBackgroundColor[0] ?? '')
            : (typeof ds.hoverBackgroundColor === 'string' ? ds.hoverBackgroundColor : ''),
        })),
      });
      setPositiveChartData(fixChartData(chartData.positiveData));
      setNegativeChartData(fixChartData(chartData.negativeData));
      setPositiveTotal(chartData.positiveTotal);
      setNegativeTotal(chartData.negativeTotal);
    }
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
      setData(initialData);
      setFilteredData(initialData);
      try {
        const initialTrendData = createMonthlyTrendData(initialData, {
          dateKey: '日付',
          categoryKey: '大項目',
          amountKey: '金額（円）',
          maxCategories: 5,
          debug: false
        });
        if (initialTrendData && initialTrendData.labels && initialTrendData.datasets) {
          setMonthlyTrendData(initialTrendData);
        }
      } catch (error) {
        console.error('初期月次推移データの生成中にエラーが発生しました:', error);
        setMonthlyTrendData(EMPTY_MONTHLY_DATA);
      }
      try {
        const initialChartData = splitDataBySign(initialData);
        const fixChartData = (data: { labels: string[]; datasets: { data: unknown[]; backgroundColor?: string | string[]; hoverBackgroundColor?: string | string[]; label?: string; [key: string]: unknown; }[] }): ChartData => ({
          labels: data.labels,
          datasets: data.datasets.map((ds) => ({
            ...ds,
            label: typeof ds.label === 'string' ? ds.label : '',
            data: (ds.data as unknown[]).map(Number),
            backgroundColor: Array.isArray(ds.backgroundColor)
              ? (ds.backgroundColor[0] ?? '')
              : (typeof ds.backgroundColor === 'string' ? ds.backgroundColor : ''),
            hoverBackgroundColor: Array.isArray(ds.hoverBackgroundColor)
              ? (ds.hoverBackgroundColor[0] ?? '')
              : (typeof ds.hoverBackgroundColor === 'string' ? ds.hoverBackgroundColor : ''),
          })),
        });
        if (initialChartData) {
          setPositiveChartData(fixChartData(initialChartData.positiveData) || positiveChartData);
          setNegativeChartData(fixChartData(initialChartData.negativeData) || negativeChartData);
          setPositiveTotal(initialChartData.positiveTotal || 0);
          setNegativeTotal(initialChartData.negativeTotal || 0);
        }
      } catch (error) {
        console.error('初期チャートデータの生成中にエラーが発生しました:', error);
      }
    }
  }, [initialData]);

  // チャートオプションをmemoで最適化
  const memoizedChartOptions = useMemo(() => chartOptions, []);

  return (
    <div className="app-container">
      <Sidebar 
        onFileUpload={handleFileUpload} 
        onFilterChange={handleFilterChange}
        filters={filters}
        initialDateRange={initialDateRange}
        onViewChange={handleViewChange}
        view={view}
        activeView={view}
        dataProcessing={dataProcessing}
      />
      
      <div className="main-content">
        {dataProcessing && (
          <div className="loading-overlay">
            <div className="loading-message">
              <div className="spinner"></div>
              データ処理中...
            </div>
          </div>
        )}

        {/* データの件数を表示するエリアを追加 */}
        <div className="data-stats">
          <span data-testid="filtered-data-count">{filteredData?.length || 0}</span>
          {filteredData?.length === 1 ? '件のデータ' : '件のデータ'}
        </div>

        {view === 'dashboard' && (
          <>
            {selectedCategory ? (
              <CategoryDetailsTable 
                category={selectedCategory?.label ?? ''}
                data={categoryFilteredData}
                onBack={() => setSelectedCategory(null)}
              />
            ) : (
              <>
                <div data-testid="dashboard-view">
                  <Charts 
                    positiveChartData={positiveChartData}
                    negativeChartData={negativeChartData}
                    positiveTotal={positiveTotal}
                    negativeTotal={negativeTotal}
                    options={memoizedChartOptions}
                    onHover={handleHover}
                    onClick={handleClick}
                    chartsKey={chartKey} // キー値を追加
                  />
                  {hoverInfo && (
                    <div className="hover-info">
                      <strong>{hoverInfo?.label}:</strong> ¥{hoverInfo?.subtotal?.toLocaleString?.() ?? ''}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
        
        {view === 'balance' && (
          <div data-testid="balance-view">
            <BalanceView 
              data={filteredData} 
              positiveTotal={positiveTotal}
              negativeTotal={negativeTotal}
              positiveData={positiveChartData}
              negativeData={negativeChartData}
              onHover={handleHover}
            />
          </div>
        )}
        
        {view === 'quadrant' && (
          <div data-testid="category-quadrant-view">
            <CategoryQuadrantView 
              data={filteredData}
              negativeTotal={negativeTotal}
            />
          </div>
        )}
        
        {view === 'category' && (
          <div data-testid="category-view">
            <CategoryPieChart 
              data={filteredData}
              onHover={handleHover}
            />
          </div>
        )}
        
        {view === 'aggregated' && (
          <div data-testid="aggregated-view">
            <AggregatedTable aggregatedData={aggregatedData} />
          </div>
        )}
        
        {view === 'monthly' && (
          <div data-testid="monthlytrend-view" className="monthly-view-container">
            <div className="view-mode-selector">
              <button 
                className={`view-mode-button ${monthlyViewMode === 'chart' ? 'active' : ''}`} 
                onClick={() => handleMonthlyViewModeChange('chart')}
              >
                グラフ表示
              </button>
              <button 
                className={`view-mode-button ${monthlyViewMode === 'table' ? 'active' : ''}`}
                onClick={() => handleMonthlyViewModeChange('table')}
              >
                テーブル表示
              </button>
            </div>
            
            <div className="prediction-controls">
              <label className="prediction-toggle">
                <input 
                  type="checkbox" 
                  checked={showPrediction} 
                  onChange={handlePredictionToggle}
                />
                予測表示
              </label>
              
              {showPrediction && (
                <div className="prediction-options">
                  <label>
                    予測期間:
                    <select 
                      value={forecastPeriods} 
                      onChange={(e) => handleForecastPeriodsChange(e.target.value)}
                    >
                      <option value="1">1ヶ月</option>
                      <option value="3">3ヶ月</option>
                      <option value="6">6ヶ月</option>
                      <option value="12">12ヶ月</option>
                    </select>
                  </label>
                  
                  <label>
                    予測手法:
                    <select 
                      value={predictionMethod} 
                      onChange={(e) => handlePredictionMethodChange(e.target.value)}
                    >
                      <option value="simple_ma">単純移動平均</option>
                      <option value="weighted_ma">加重移動平均</option>
                      <option value="seasonal_ma">季節性移動平均</option>
                      <option value="arima">ARIMA</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
            
            {monthlyViewMode === 'chart' ? (
              <MonthlyTrendChart 
                trendData={monthlyTrendData} 
                showPrediction={showPrediction}
                forecastPeriods={forecastPeriods}
                predictionMethod={predictionMethod}
              />
            ) : (
              <MonthlyTrendTable 
                trendData={monthlyTrendData} 
                showPrediction={showPrediction}
              />
            )}
          </div>
        )}
        
        {view === 'data' && (
          <div data-testid="rawdata-view">
            <DataTable data={filteredData} />
          </div>
        )}
        
        {view === 'investment' && (
          <div data-testid="investment-view">
            <InvestmentView data={filteredData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;