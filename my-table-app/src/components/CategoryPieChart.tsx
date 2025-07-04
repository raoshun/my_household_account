import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import PropTypes from 'prop-types';
import type { CategoryPieChartProps as _CategoryPieChartProps } from '../types';

const MAIN_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FFB6B6', '#B6FFB6', '#B6D4FF'];
const SUB_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
  '#2C7BE5', '#27AE60', '#9B59B6', '#F1C40F', '#E74C3C'
];

// 角度とセグメント情報を計算する関数
const calculateAngleLayout = (data) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  // 各項目の開始角度と終了角度を計算
  return data.map(item => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...item,
      startAngle,
      endAngle,
      percentage: (item.value / total) * 100
    };
  });
};

// カスタム凡例コンポーネント（大項目のみ表示）
export const CustomLegend = (props) => {
  const { payload } = props;

  // 大項目のみをフィルタリング
  const mainCategoryItems = payload ? payload.filter(entry => !entry.value.includes(' - ')) : [];

  if (!mainCategoryItems || mainCategoryItems.length === 0) {
    return null;
  }

  return (
    <ul className="custom-legend" data-testid="custom-legend" style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
      {mainCategoryItems.map((entry, index) => (
        <li key={`legend-item-${index}`} style={{ display: 'inline-block', marginRight: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{ 
                width: '10px', 
                height: '10px', 
                backgroundColor: entry.color, 
                marginRight: '5px',
                borderRadius: '50%' 
              }} 
            />
            <span data-testid={`legend-${entry.value}`}>{entry.value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

// CustomLegendのPropTypes定義
CustomLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      color: PropTypes.string,
      type: PropTypes.string
    })
  )
};

// デフォルトprops
CustomLegend.defaultProps = {
  payload: []
};

// カスタムツールチップコンポーネント
export const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0] || {};
  const [mainCategory, subCategory] = (data.name || '').split(' - ');
  const isSubCategory = subCategory !== undefined;

  return (
    <div 
      data-testid="custom-tooltip"
      style={{ 
        backgroundColor: '#fff', 
        padding: '5px 10px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
      }}
    >
      {isSubCategory ? (
        <>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{mainCategory}</p>
          <p style={{ margin: '0 0 5px 0' }}>
            <span style={{ fontWeight: 'bold' }}>中項目: </span>
            {subCategory}
          </p>
          <p style={{ margin: '0' }}>
            <span style={{ fontWeight: 'bold' }}>金額: </span>
            ¥{data.value ? data.value.toLocaleString() : 0}
          </p>
          <p style={{ margin: '0', fontSize: '0.8em', color: '#666' }}>
            {data.payload && data.payload.mainTotal ? 
              `${Math.round((data.value / data.payload.mainTotal) * 100)}% （カテゴリ内）` : 
              '0% （カテゴリ内）'
            }
          </p>
        </>
      ) : (
        <>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
            {mainCategory}
          </p>
          <p style={{ margin: '0' }}>
            <span style={{ fontWeight: 'bold' }}>合計: </span>
            ¥{data.value ? data.value.toLocaleString() : 0}
          </p>
          <p style={{ margin: '0', fontSize: '0.8em', color: '#666' }}>
            {data.payload && data.payload.total ?
              `${Math.round((data.value / data.payload.total) * 100)}% （全体）` :
              '0% （全体）'
            }
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: '#666' }}>
            中項目の詳細はドーナツグラフの外側にホバーしてください
          </p>
        </>
      )}
    </div>
  );
};

// CustomTooltipのPropTypes定義
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      dataKey: PropTypes.string,
      payload: PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.number,
        mainCategory: PropTypes.string,
        mainTotal: PropTypes.number,
        total: PropTypes.number
      })
    })
  )
};

// デフォルトprops
CustomTooltip.defaultProps = {
  active: false,
  payload: []
};

const CategoryPieChart: React.FC<_CategoryPieChartProps> = ({ data = {} }) => {
  // 状態の保持
  const [mainDataWithLayout, setMainDataWithLayout] = useState([]);
  const [subDataWithLayout, setSubDataWithLayout] = useState([]);
  const [startAngle] = useState(-90); // 12時の位置から開始
  const [endAngle] = useState(270);    // 360-90 で一周

  useEffect(() => {
    // 総額を計算
    const total = Object.values(data)
      .filter((value): value is number => typeof value === 'number')
      .reduce((sum, value) => sum + value, 0);
    
    // 大分類ごとに合計を集計
    const mainTotals = {};
    Object.entries(data).forEach(([key, value]) => {
      const [main] = key.split(' - ');
      if (!mainTotals[main]) mainTotals[main] = 0;
      mainTotals[main] += value;
    });

    // 大分類データ
    const mainData = Object.keys(mainTotals).map((main, idx) => ({
      name: main,
      value: mainTotals[main],
      color: MAIN_COLORS[idx % MAIN_COLORS.length],
      total: total,  // 全体の合計を追加
    }));

    // 大分類の角度レイアウトを計算
    const mainWithLayout = calculateAngleLayout(mainData);
    setMainDataWithLayout(mainWithLayout);

    // 中分類データを大分類ごとにグループ化
    const subDataByMain = {};
    Object.keys(mainTotals).forEach(main => {
      subDataByMain[main] = [];
    });

    // 中分類データをグループ化
    Object.entries(data).forEach(([key, value]) => {
      const [main] = key.split(' - ');
      const mainIdx = Object.keys(mainTotals).indexOf(main);
      
      if (subDataByMain[main]) {
        subDataByMain[main].push({
          name: key,
          value,
          color: SUB_COLORS[Object.keys(data).indexOf(key) % SUB_COLORS.length],
          mainCategory: main,
          mainColor: MAIN_COLORS[mainIdx % MAIN_COLORS.length],
          mainTotal: mainTotals[main],  // この大分類の合計
          total: total,                 // 全体の合計
        });
      }
    });

    // 各大分類ごとの中分類データに角度情報を追加
    const allSubDataWithLayout = [];
    
    mainWithLayout.forEach(mainItem => {
      const main = mainItem.name;
      const mainStartAngle = mainItem.startAngle;
      const mainEndAngle = mainItem.endAngle;
      const subItems = subDataByMain[main] || [];
      
      // この大分類の中分類合計
      const subTotal = subItems.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = mainStartAngle;
      
      // 中分類ごとの角度を計算
      const subItemsWithAngles = subItems.map(subItem => {
        const ratio = subItem.value / subTotal;
        const angle = ratio * (mainEndAngle - mainStartAngle);
        const subStartAngle = currentAngle;
        const subEndAngle = currentAngle + angle;
        currentAngle = subEndAngle;
        
        return {
          ...subItem,
          startAngle: subStartAngle,
          endAngle: subEndAngle,
        };
      });
      
      allSubDataWithLayout.push(...subItemsWithAngles);
    });

    setSubDataWithLayout(allSubDataWithLayout);
  }, [data]);

  return (
    <PieChart width={400} height={400}>
      {/* 内側：大分類 */}
      <Pie
        data={mainDataWithLayout}
        dataKey="value"
        nameKey="name"
        cx={200}
        cy={200}
        innerRadius={60}
        outerRadius={100}
        label
        startAngle={startAngle}
        endAngle={endAngle}
        paddingAngle={2}  // セグメント間の隙間
      >
        {mainDataWithLayout.map((entry, idx) => (
          <Cell key={`main-cell-${idx}`} fill={entry.color} />
        ))}
      </Pie>
      
      {/* 外側：中分類 - ラベル表示を省略 */}
      <Pie
        data={subDataWithLayout}
        dataKey="value"
        nameKey="name"
        cx={200}
        cy={200}
        innerRadius={105}
        outerRadius={150}
        label={false}  // ラベルを非表示にする
        startAngle={startAngle}
        endAngle={endAngle}
        paddingAngle={0.5}  // セグメント間の小さな隙間
      >
        {subDataWithLayout.map((entry, idx) => (
          <Cell key={`sub-cell-${idx}`} fill={entry.color} />
        ))}
      </Pie>
      
      {/* カスタムツールチップ */}
      <Tooltip content={<CustomTooltip />} />
      
      {/* カスタム凡例（大項目のみ表示） */}
      <Legend content={<CustomLegend />} />
    </PieChart>
  );
};

export default CategoryPieChart;