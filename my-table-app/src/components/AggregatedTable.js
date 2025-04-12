import React from 'react';
import PropTypes from 'prop-types';

const AggregatedTable = ({ aggregatedData }) => {
	return (
	<table>
		<thead>
			<tr>
				<th>大項目</th>
				<th>中項目</th>
				<th>合計金額（円）</th>
			</tr>
		</thead>
		<tbody>
			{Object.keys(aggregatedData).map((majorCategory) => (
				Object.keys(aggregatedData[majorCategory]).map((minorCategory) => (
					<tr key={`${majorCategory}-${minorCategory}`}>
						<td>{majorCategory}</td>
						<td>{minorCategory}</td>
						<td>{aggregatedData[majorCategory][minorCategory].toLocaleString()}</td>
					</tr>
				))
			))}
		</tbody>
	</table>
  );
};

AggregatedTable.propTypes = {
  aggregatedData: PropTypes.object.isRequired,
};

export default AggregatedTable;