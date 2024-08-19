import Papa from 'papaparse';
import iconv from 'iconv-lite';
import { Buffer } from 'buffer';
import { splitDataBySign } from '../utils';

export const handleFiles = (files, setData, setPositiveChartData, setNegativeChartData, setPositiveTotal, setNegativeTotal) => {
  let allData = [];
  let filesProcessed = 0;

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const csvBuffer = e.target.result;
      const csvText = iconv.decode(Buffer.from(csvBuffer), 'Shift_JIS');
      console.log(csvText);
      Papa.parse(csvText, {
        header: true,
        delimiter: ',', // 必要に応じてデリミタを指定
        skipEmptyLines: true, // 空行をスキップ
        dynamicTyping: true, // 自動的に型を推測
        complete: (result) => {
          if (result.errors.length > 0) {
            console.error('Errors:', result.errors);
            console.log('Data:', result.data);
          }
          const formattedData = result.data.map(item => ({
            '計算対象': item['計算対象'],
            '日付': item['日付'] ? new Date(item['日付'].replace(/-/g, '/')) : null, // 日付をDateオブジェクトに変換
            '内容': item['内容'],
            '金額（円）': parseInt(item['金額（円）'], 10), // 基数を指定
            '保有金融機関': item['保有金融機関'],
            '大項目': item['大項目'],
            '中項目': item['中項目'],
            'メモ': item['メモ'],
            '振替': item['振替'],
            'ID': item['ID'],
          }));
          console.log(formattedData); // 整形後のデータをコンソールに出力
          allData = allData.concat(formattedData);
          filesProcessed++;
          if (filesProcessed === files.length) {
            setData(allData);

            // データをプラスとマイナスに分割
            const { positiveData, negativeData, positiveTotal, negativeTotal } = splitDataBySign(allData);
            setPositiveChartData(positiveData);
            setNegativeChartData(negativeData);
            setPositiveTotal(positiveTotal);
            setNegativeTotal(negativeTotal);
          }
        },
      });
    };
    reader.readAsArrayBuffer(file);
  });
};