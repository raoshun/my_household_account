import React from 'react';
import PropTypes from 'prop-types';
import ReactFileReader from 'react-file-reader';

const Sidebar = ({ setView, handleFiles }) => {
    return (
        <div className="sidebar" style={{ width: '200px', padding: '10px', background: '#f4f4f4' }}>
            <button onClick={() => setView('chart')}>円グラフ</button>
            <button onClick={() => setView('table')}>表</button>
            <ReactFileReader handleFiles={handleFiles} fileTypes={'.csv'} multipleFiles={true}>
                <button className='btn'>Upload CSV</button>
            </ReactFileReader>
        </div>
    );
};

Sidebar.propTypes = {
  setView: PropTypes.func.isRequired,
  handleFiles: PropTypes.func.isRequired,
};

export default Sidebar;