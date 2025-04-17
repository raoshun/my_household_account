import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactFileReader from 'react-file-reader';
import './Sidebar.css';

const Sidebar = ({ setView, handleFiles, currentView = 'chart', filters = {}, onFilterChange, initialDateRange = {} }) => {
    const [expanded, setExpanded] = useState(false);
    
    const toggleSidebar = () => {
        setExpanded(!expanded);
    };
    
    const handleViewChange = (view) => {
        setView(view);
        if (window.innerWidth <= 768) {
            setExpanded(false);
        }
    };

    const toggleExcludeTransfers = () => {
        onFilterChange && onFilterChange('excludeTransfers', !filters.excludeTransfers);
    };

    const handleStartDateChange = (e) => {
        onFilterChange && onFilterChange('startDate', e.target.value);
    };

    const handleEndDateChange = (e) => {
        onFilterChange && onFilterChange('endDate', e.target.value);
    };

    const resetDateFilter = () => {
        // 初期値（CSVから検出した日付範囲）にリセット
        onFilterChange && onFilterChange('startDate', initialDateRange.startDate || '');
        onFilterChange && onFilterChange('endDate', initialDateRange.endDate || '');
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
                    className={`sidebar-button ${currentView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleViewChange('dashboard')}
                    data-testid="dashboard-button"
                >
                    <span className="sidebar-button-icon">📊</span>
                    ダッシュボード
                </button>
                <button 
                    className={`sidebar-button ${currentView === 'rawdata' ? 'active' : ''}`}
                    onClick={() => handleViewChange('rawdata')}
                    data-testid="rawdata-button"
                >
                    <span className="sidebar-button-icon">📄</span>
                    生データ
                </button>
                <button 
                    className={`sidebar-button ${currentView === 'monthlytrend' ? 'active' : ''}`}
                    onClick={() => handleViewChange('monthlytrend')}
                    data-testid="monthlytrend-button"
                >
                    <span className="sidebar-button-icon">📈</span>
                    月次推移
                </button>
                <button 
                    className={`sidebar-button ${currentView === 'balance' ? 'active' : ''}`}
                    onClick={() => handleViewChange('balance')}
                    data-testid="balance-button"
                >
                    <span className="sidebar-button-icon">💹</span>
                    収支バランス
                </button>
                <button 
                    className={`sidebar-button ${currentView === 'categoryQuadrant' ? 'active' : ''}`}
                    onClick={() => handleViewChange('categoryQuadrant')}
                    data-testid="category-quadrant-button"
                >
                    <span className="sidebar-button-icon">🧩</span>
                    カテゴリ四分法
                </button>
                
                <h3 className="sidebar-section-title">フィルター</h3>
                <div className="sidebar-filter-option">
                    <label className="sidebar-checkbox-container">
                        <input 
                            type="checkbox"
                            checked={!!filters.excludeTransfers}
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
                                value={filters.startDate || ''}
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
                                value={filters.endDate || ''}
                                onChange={handleEndDateChange}
                                className="date-input"
                                data-testid="end-date-input"
                            />
                        </div>
                        
                        {(filters.startDate || filters.endDate) && (
                            <button 
                                className="clear-date-filter" 
                                onClick={resetDateFilter}
                                data-testid="clear-date-filter"
                            >
                                期間フィルターを初期値にリセット
                            </button>
                        )}
                    </div>
                </div>
                
                <h3 className="sidebar-section-title">データ</h3>
                <ReactFileReader
                    handleFiles={handleFiles}
                    fileTypes={'.csv'}
                    multipleFiles={true}
                >
                    <button className="sidebar-button primary-button">
                        <span className="sidebar-button-icon">📂</span>
                        CSVをアップロード
                    </button>
                </ReactFileReader>
            </div>
            
            <div className="sidebar-footer">
                <p>© 2023 家計簿分析アプリ</p>
            </div>
        </div>
    );
};

Sidebar.propTypes = {
    setView: PropTypes.func.isRequired,
    handleFiles: PropTypes.func.isRequired,
    currentView: PropTypes.string,
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    initialDateRange: PropTypes.object
};

export default Sidebar;