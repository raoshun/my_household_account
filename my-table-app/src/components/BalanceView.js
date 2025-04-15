import React from 'react';
import PropTypes from 'prop-types';
import './BalanceView.css';

/**
 * 収支バランスを視覚的に表示するコンポーネント
 * 
 * @param {Object} props
 * @param {number} props.positiveTotal - 収入合計額
 * @param {number} props.negativeTotal - 支出合計額（負の値）
 * @param {Object} props.positiveData - 収入のチャートデータ
 * @param {Object} props.negativeData - 支出のチャートデータ
 * @returns {JSX.Element} 収支バランスビュー
 */
const BalanceView = ({ positiveTotal = 0, negativeTotal = 0, positiveData = {}, negativeData = {} }) => {
  // 収支バランス（黒字/赤字）を計算
  const balance = positiveTotal + negativeTotal; // negativeTotal は負の値なので加算
  
  // バランス比率を計算 (0.00 ~ 1.00)
  const totalAmount = Math.abs(positiveTotal) + Math.abs(negativeTotal);
  const positiveRatio = totalAmount !== 0 ? Math.abs(positiveTotal) / totalAmount : 0.5;
  const negativeRatio = totalAmount !== 0 ? Math.abs(negativeTotal) / totalAmount : 0.5;
  
  // パーセンテージに変換
  const positivePercentage = Math.round(positiveRatio * 100);
  const negativePercentage = Math.round(negativeRatio * 100);

  // 収支状態を判定
  const balanceStatus = balance > 0 ? 'surplus' : balance < 0 ? 'deficit' : 'break-even';

  return (
    <div className="balance-view-container">
      <h2 className="balance-view-title">収支バランス</h2>

      {/* 収支概要カード */}
      <div className={`balance-summary-card ${balanceStatus}`}>
        <div className="balance-header">
          <h3>今月の収支</h3>
          <span className={`balance-amount ${balanceStatus}`}>
            ¥{balance.toLocaleString()}
          </span>
        </div>
        
        <div className="balance-status">
          {balanceStatus === 'surplus' && '黒字'}
          {balanceStatus === 'deficit' && '赤字'}
          {balanceStatus === 'break-even' && '収支均衡'}
        </div>
      </div>
      
      {/* 収支比率バー */}
      <div className="balance-ratio-container">
        <div className="balance-ratio-bar">
          <div className="income-bar" style={{ width: `${positivePercentage}%` }}>
            {positivePercentage >= 10 && `${positivePercentage}%`}
          </div>
          <div className="expense-bar" style={{ width: `${negativePercentage}%` }}>
            {negativePercentage >= 10 && `${negativePercentage}%`}
          </div>
        </div>
        <div className="balance-ratio-labels">
          <div className="income-label">収入: ¥{positiveTotal.toLocaleString()}</div>
          <div className="expense-label">支出: ¥{Math.abs(negativeTotal).toLocaleString()}</div>
        </div>
      </div>

      {/* 収支詳細 */}
      <div className="balance-details">
        <div className="balance-detail-card">
          <h3>収入内訳</h3>
          <div className="category-list">
            {positiveData.labels && positiveData.labels.map((label, index) => (
              <div key={label} className="category-item">
                <span className="category-name">{label}</span>
                <span className="category-amount">¥{positiveData.datasets[0].data[index].toLocaleString()}</span>
                <div className="category-bar">
                  <div className="category-fill" style={{ 
                    width: `${(positiveData.datasets[0].data[index] / positiveTotal * 100).toFixed(1)}%`,
                    backgroundColor: positiveData.datasets[0].backgroundColor[index] || '#36A2EB'
                  }}></div>
                </div>
              </div>
            ))}
            {(!positiveData.labels || positiveData.labels.length === 0) && (
              <div className="no-data-message">収入データがありません</div>
            )}
          </div>
        </div>

        <div className="balance-detail-card">
          <h3>支出内訳</h3>
          <div className="category-list">
            {negativeData.labels && negativeData.labels.map((label, index) => (
              <div key={label} className="category-item">
                <span className="category-name">{label}</span>
                <span className="category-amount">¥{negativeData.datasets[0].data[index].toLocaleString()}</span>
                <div className="category-bar">
                  <div className="category-fill" style={{ 
                    width: `${(negativeData.datasets[0].data[index] / Math.abs(negativeTotal) * 100).toFixed(1)}%`,
                    backgroundColor: negativeData.datasets[0].backgroundColor[index] || '#FF6384'
                  }}></div>
                </div>
              </div>
            ))}
            {(!negativeData.labels || negativeData.labels.length === 0) && (
              <div className="no-data-message">支出データがありません</div>
            )}
          </div>
        </div>
      </div>

      {/* 家計アドバイス */}
      <div className="balance-advice-container">
        <h3>収支状況のアドバイス</h3>
        <div className="balance-advice">
          {balance > 0 && (
            <>
              <p>黒字状態です！貯金や投資を検討しましょう。</p>
              <ul>
                <li>将来の目標に向けて貯蓄を増やしましょう</li>
                <li>余剰資金は効率的に運用することを検討しましょう</li>
              </ul>
            </>
          )}
          {balance < 0 && (
            <>
              <p>赤字状態です。支出を見直しましょう。</p>
              <ul>
                <li>支出が多いカテゴリを確認し、削減できる項目を検討しましょう</li>
                <li>固定費の見直しも効果的です</li>
              </ul>
            </>
          )}
          {balance === 0 && (
            <>
              <p>収支が均衡しています。</p>
              <ul>
                <li>予想外の出費に備え、少しでも貯蓄を増やすことを検討しましょう</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

BalanceView.propTypes = {
  positiveTotal: PropTypes.number,
  negativeTotal: PropTypes.number,
  positiveData: PropTypes.object,
  negativeData: PropTypes.object
};

export default BalanceView;