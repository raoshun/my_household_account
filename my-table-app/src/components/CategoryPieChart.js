import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import PropTypes from 'prop-types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CategoryPieChart = ({ data }) => {
  const chartData = Object.keys(data).map((key, index) => ({
    name: key,
    value: data[key],
    color: COLORS[index % COLORS.length]
  }));

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={chartData}
        cx={200}
        cy={200}
        labelLine={false}
        outerRadius={150}
        fill="#8884d8"
        dataKey="value"
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

CategoryPieChart.propTypes = {
  data: PropTypes.object.isRequired,
};

export default CategoryPieChart;