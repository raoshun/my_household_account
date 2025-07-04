import React from 'react';

interface DateTimeItem {
  date: string;
  time: string;
}

interface DateTimeTableProps {
  data: DateTimeItem[];
}

const DateTimeTable: React.FC<DateTimeTableProps> = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.date}</td>
            <td>{item.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DateTimeTable;