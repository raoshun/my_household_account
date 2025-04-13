import React, { useState, useEffect } from 'react';
import AggregatedTable from './components/AggregatedTable';
import Sidebar from './components/Sidebar';
import Charts from './components/Charts';
import DataTable from './components/DataTable';
import { handleFiles } from './components/fileHandlers';
import { chartOptions } from './config/chartOptions';
import calculateCategoryTotals from './utils/calculateCategoryTotals';
import { filterData } from './utils/sortData';
import PropTypes from 'prop-types';
import CategoryDetailsTable from './components/CategoryDetailsTable';
import './App.css';

const App = ({ initialData = [] }) => {
  const [data, setData] = useState(initialData);
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
  const [positiveTotal, setPositiveTotal] = useState(0);
  const [negativeTotal, setNegativeTotal] = useState(0);
  const [view, setView] = useState('dashboard'); // 初期ビューを'dashboard'に変更
  const [filteredData, setFilteredData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null); // ホバー情報を保持する状態
  const [aggregatedData, setAggregatedData] = useState({});
  const [categoryTotals, setCategoryTotals] = useState({});
  const [filters, setFilters] = useState({}); // filters状態を追加
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFilteredData, setCategoryFilteredData] = useState([]);
  const [prevFilters, setPrevFilters] = useState({}); // 前回のフィルタ状態を保存
  const [chartKey, setChartKey] = useState(0); // チャートの強制リロード用キー

  // ファイルハンドラをラップする関数を作成
  const handleFileUpload = (files) => {
    handleFiles(files, {
      setData,
      setPositiveChartData,
      setNegativeChartData,
      setPositiveTotal,
      setNegativeTotal,
      setAggregatedData,
      setCategoryTotals
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
    const newFilteredData = filterData(data, filters);
    setFilteredData(newFilteredData);
    
    // フィルタの変更を検出
    const filtersChanged = 
      JSON.stringify(prevFilters) !== JSON.stringify(filters);
    
    // フィルタが変更された場合のみチャートをリロード
    if (filtersChanged) {
      setPrevFilters(filters);
      setChartKey(prevKey => prevKey + 1); // キーを変更して強制リロード
    }
    
    calculateCategoryTotals(newFilteredData)
      .then(totals => setCategoryTotals(totals))
      .catch(error => console.error('カテゴリ合計の計算中にエラーが発生しました:', error));
  }, [data, filters]);

  // コンポーネントがマウントされた時に初期データが存在する場合は使用
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      // 初期データを設定
      setData(initialData);
      // 初期データをフィルタリングデータとしても設定
      setFilteredData(initialData);
    }

    // テスト環境でグローバル変数を確認（別のアプローチ）
    if (window.__TEST_DATA__) {
      setData(window.__TEST_DATA__);
    }
  }, [initialData]);

  return (
    <div className="app-container">
      <Sidebar setView={setView} handleFiles={handleFileUpload} currentView={view} />
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
                  <div className="dashboard-charts">
                    <h2 className="section-title">収支の可視化</h2>
                    <Charts
                      key={chartKey}
                      positiveChartData={positiveChartData}
                      negativeChartData={negativeChartData}
                      positiveTotal={positiveTotal}
                      negativeTotal={negativeTotal}
                      options={chartOptions}
                      onHover={handleHover}
                      onClick={handleClick}
                    />

                    {hoverInfo && hoverInfo.subtotal !== undefined && (
                      <div className="hover-info-card">
                        <h3>詳細情報</h3>
                        <p><strong>項目名:</strong> {hoverInfo.label}</p>
                        <p><strong>小計:</strong> ¥{hoverInfo.subtotal.toLocaleString()}</p>
                        <p className="hover-info-hint">クリックで詳細を表示</p>
                      </div>
                    )}
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
                        category={selectedCategory.label}
                        title={`「${selectedCategory.label}」の明細`}
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