import React from 'react';
import PropTypes from 'prop-types';
import './AggregatedTable.css';

const AggregatedTable = ({ aggregatedData }) => {
	return (
    <div className="aggregated-table-container">
      <table className="modern-table">
        <thead>
          <tr>
            <th>大項目</th>
            <th>中項目</th>
            <th>合計金額（円）</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(aggregatedData).map((majorCategory) => (
            Object.keys(aggregatedData[majorCategory]).map((minorCategory, index) => {
              const amount = aggregatedData[majorCategory][minorCategory];
              const isPositive = amount >= 0;
              
              return (
                <tr key={`${majorCategory}-${minorCategory}`} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td>{majorCategory}</td>
                  <td>{minorCategory}</td>
                  <td className={isPositive ? 'positive-amount' : 'negative-amount'}>
                    ¥{amount.toLocaleString()}
                  </td>
                </tr>
              );
            })
          ))}
        </tbody>
      </table>
    </div>
  );
};

AggregatedTable.propTypes = {
  aggregatedData: PropTypes.object.isRequired,
};

export default AggregatedTable;