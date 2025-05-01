import React from 'react';
import PropTypes from 'prop-types';

/**
 * 投資分析ビュー（株式・投資信託・不動産）
 * @param {Object[]} data - フィルタ済みの家計簿データ
 */
const InvestmentView = ({ data = [] }) => {
  // 株式・投資信託をまとめて抽出
  const stocksAndFunds = data.filter(item => item['大項目'] === '株式' || item['大項目'] === '投資信託');
  const realEstate = data.filter(item => item['大項目'] === '不動産');

  return (
    <div className="investment-view-container">
      <section>
        <h3>株式・投資信託</h3>
        <p>保有銘柄・損益・推移グラフなど（今後実装）</p>
        <div>件数: {stocksAndFunds.length}</div>
      </section>
      <section>
        <h3>不動産</h3>
        <p>不動産資産・評価額・推移グラフなど（今後実装）</p>
        <div>件数: {realEstate.length}</div>
      </section>
    </div>
  );
};

InvestmentView.propTypes = {
  data: PropTypes.array
};

export default InvestmentView;
