import React from 'react';
import PropTypes from 'prop-types';
import ReactFileReader from 'react-file-reader';
import './Sidebar.css';

const Sidebar = ({ setView, handleFiles }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>家計簿分析</h2>
            </div>
            
            <div className="sidebar-menu">
                <h3 className="sidebar-section-title">表示</h3>
                <button 
                    className="sidebar-button" 
                    onClick={() => setView('chart')}
                >
                    <span className="sidebar-button-icon">📊</span>
                    円グラフ
                </button>
                <button 
                    className="sidebar-button" 
                    onClick={() => setView('table')}
                >
                    <span className="sidebar-button-icon">📋</span>
                    表
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
};

export default Sidebar;