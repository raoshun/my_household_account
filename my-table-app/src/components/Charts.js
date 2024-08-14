import React from 'react';
import { Pie } from 'react-chartjs-2';

const Charts = ({ positiveChartData, negativeChartData, positiveTotal, negativeTotal, options }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 45%', maxWidth: '45%', margin: '10px' }}>
                <h2>収入: ¥{positiveTotal.toLocaleString()}</h2>
                <Pie data={positiveChartData} options={options} />
            </div>
            <div style={{ flex: '1 1 45%', maxWidth: '45%', margin: '10px' }}>
                <h2>支出: ¥{negativeTotal.toLocaleString()}</h2>
                <Pie data={negativeChartData} options={options} />
            </div>
        </div>
    );
};

export default Charts;
