import React from 'react';
import PropTypes from 'prop-types';

const CategoryItems = ({ data, category }) => {
  const filteredData = data.filter(item => item['大項目'] === category);

  return (
    <div>
      <h2>{category}の項目</h2>
      <table>
        <thead>
          <tr>
            <th>計算対象</th>
            <th>日付</th>
            <th>内容</th>
            <th>金額（円）</th>
            <th>保有金融機関</th>
            <th>中項目</th>
            <th>メモ</th>
            <th>振替</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item['計算対象']}</td>
              <td>{item['日付'] ? item['日付'].toLocaleDateString() : ''}</td>
              <td>{item['内容']}</td>
              <td>{item['金額（円）'].toLocaleString()}</td>
              <td>{item['保有金融機関']}</td>
              <td>{item['中項目']}</td>
              <td>{item['メモ']}</td>
              <td>{item['振替']}</td>
              <td>{item['ID']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CategoryItems.propTypes = {
  data: PropTypes.array.isRequired,
  category: PropTypes.string.isRequired,
};

export default CategoryItems;
