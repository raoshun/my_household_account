import type { SidebarProps as _SidebarProps } from '../types';

import React, { useState, useEffect } from 'react';
import ReactFileReader from 'react-file-reader';
import './Sidebar.css';

const Sidebar: React.FC<_SidebarProps> = ({
  onViewChange = () => {}, 
  onFileUpload = () => {}, 
  activeView = 'dashboard', 
  filters = {}, 
  onFilterChange, 
  initialDateRange = undefined,
  dataProcessing = false
}) => {
    const [expanded, setExpanded] = useState(false);
    // initialDateRangeが更新されたらフィルターを更新するためのeffect
    useEffect(() => {
        if (
          initialDateRange &&
          typeof initialDateRange.startDate === 'string' &&
          typeof initialDateRange.endDate === 'string'
        ) {
            // 日付フィルターを初期値で設定
            if (!filters['startDate']) {
                if (onFilterChange) onFilterChange('startDate', initialDateRange.startDate);
            }
            if (!filters['endDate']) {
                if (onFilterChange) onFilterChange('endDate', initialDateRange.endDate);
            }
        }
    }, [initialDateRange, onFilterChange]);

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };

    const handleViewChange = (view: string) => {
        onViewChange(view);
        if (window.innerWidth <= 768) {
            setExpanded(false);
        }
    };

    const toggleExcludeTransfers = () => {
        if (onFilterChange) onFilterChange('excludeTransfers', !filters['excludeTransfers']);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onFilterChange) onFilterChange('startDate', e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onFilterChange) onFilterChange('endDate', e.target.value);
    };

    const resetDateFilter = () => {
        if (onFilterChange) onFilterChange('startDate', initialDateRange && typeof initialDateRange.startDate === 'string' ? initialDateRange.startDate : '');
        if (onFilterChange) onFilterChange('endDate', initialDateRange && typeof initialDateRange.endDate === 'string' ? initialDateRange.endDate : '');
    };

    return (
        <div className={`sidebar ${expanded ? 'expanded' : ''}`}>
            <div className="sidebar-header">
                <h2>家計簿分析</h2>
                <button className="mobile-toggle" onClick={toggleSidebar}>
                    {expanded ? '✕' : '☰'}
                </button>
            </div>
            
            <div className="sidebar-menu">
                <h3 className="sidebar-section-title">表示</h3>
                <button 
                    className={`sidebar-button ${activeView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleViewChange('dashboard')}
                    data-testid="dashboard-button"
                >
                    <span className="sidebar-button-icon">📊</span>
                    ダッシュボード
                </button>
                <button 
                    className={`sidebar-button ${activeView === 'data' ? 'active' : ''}`}
                    onClick={() => handleViewChange('data')}
                    data-testid="rawdata-button"
                >
                    <span className="sidebar-button-icon">📄</span>
                    生データ
                </button>
                <button 
                    className={`sidebar-button ${activeView === 'trend' ? 'active' : ''}`}
                    onClick={() => handleViewChange('trend')}
                    data-testid="trend-button"
                >
                    <span className="sidebar-button-icon">📈</span>
                    トレンド分析
                </button>
                <button 
                    className={`sidebar-button ${activeView === 'balance' ? 'active' : ''}`}
                    onClick={() => handleViewChange('balance')}
                    data-testid="balance-button"
                >
                    <span className="sidebar-button-icon">💹</span>
                    収支バランス
                </button>
                <button 
                    className={`sidebar-button ${activeView === 'quadrant' ? 'active' : ''}`}
                    onClick={() => handleViewChange('quadrant')}
                    data-testid="category-quadrant-button"
                >
                    <span className="sidebar-button-icon">🧩</span>
                    カテゴリ四分法
                </button>
                <button 
                    className={`sidebar-button ${activeView === 'investment' ? 'active' : ''}`}
                    onClick={() => handleViewChange('investment')}
                    data-testid="investment-button"
                >
                    <span className="sidebar-button-icon">💰</span>
                    投資
                </button>
                
                <h3 className="sidebar-section-title">フィルター</h3>
                <div className="sidebar-filter-option">
                    <label className="sidebar-checkbox-container">
                        <input 
                            type="checkbox"
                            checked={Boolean(filters['excludeTransfers'])}
                            onChange={toggleExcludeTransfers}
                            data-testid="exclude-transfers-checkbox"
                        />
                        <span className="sidebar-checkbox-text">振替を除外する</span>
                    </label>
                </div>
                
                <div className="sidebar-filter-section">
                    <h4 className="sidebar-filter-title">期間を指定</h4>
                    <div className="sidebar-date-filter">
                        <div className="date-filter-row">
                            <label htmlFor="start-date">開始日:</label>
                            <input 
                                type="date"
                                id="start-date"
                                value={typeof filters['startDate'] === 'string' ? filters['startDate'] as string : ''}
                                onChange={handleStartDateChange}
                                className="date-input"
                                data-testid="start-date-input"
                            />
                        </div>
                        <div className="date-filter-row">
                            <label htmlFor="end-date">終了日:</label>
                            <input 
                                type="date"
                                id="end-date"
                                value={typeof filters['endDate'] === 'string' ? filters['endDate'] as string : ''}
                                onChange={handleEndDateChange}
                                className="date-input"
                                data-testid="end-date-input"
                            />
                        </div>
                        
                        {(typeof filters['startDate'] === 'string' && filters['startDate']) || (typeof filters['endDate'] === 'string' && filters['endDate']) ? (
                            <button 
                                className="clear-date-filter" 
                                onClick={resetDateFilter}
                                data-testid="clear-date-filter"
                            >
                                期間フィルターを初期値にリセット
                            </button>
                        ) : null}
                    </div>
                </div>
                
                <h3 className="sidebar-section-title">データ</h3>
                <ReactFileReader
                    handleFiles={onFileUpload}
                    fileTypes={'.csv'}
                    multipleFiles={true}
                    disabled={dataProcessing}
                >
                    <button 
                      className={`sidebar-button primary-button ${dataProcessing ? 'disabled' : ''}`}
                      data-testid="upload-csv-button"
                      disabled={dataProcessing}
                    >
                        <span className="sidebar-button-icon">📂</span>
                        {dataProcessing ? 'データ処理中...' : 'CSVをアップロード'}
                    </button>
                </ReactFileReader>
            </div>
            
            <div className="sidebar-footer">
                <p>© 2023 家計簿分析アプリ</p>
            </div>
        </div>
    );
};

export default Sidebar;