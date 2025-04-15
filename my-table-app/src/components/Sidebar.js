import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactFileReader from 'react-file-reader';
import './Sidebar.css';

const Sidebar = ({ setView, handleFiles, currentView = 'chart' }) => {
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
    currentView: PropTypes.string
};

// defaultPropsを削除し、代わりに関数の引数でデフォルト値を設定しました

export default Sidebar;