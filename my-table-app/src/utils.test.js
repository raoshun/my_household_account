/* eslint-env jest */
import { aggregateDataByCategory, splitDataBySign, testAggregateDataByCategory } from './utils';
import { describe, test, expect, jest } from '@jest/globals';

describe('utils', () => {
  test('aggregateDataByCategory correctly aggregates data', () => {
    const testData = [
      { '大項目': '食費', '金額（円）': 1000 },
      { '大項目': '食費', '金額（円）': 1500 },
      { '大項目': '交通費', '金額（円）': 500 }
    ];
    
    const expectedResult = {
      labels: ['食費', '交通費'],
      datasets: [{
        data: [2500, 500],
        backgroundColor: expect.any(Array),
        hoverBackgroundColor: expect.any(Array)
      }]
    };
    
    expect(aggregateDataByCategory(testData)).toEqual(expectedResult);
  });
  
  test('splitDataBySign correctly splits positive and negative data', () => {
    const testData = [
      { '大項目': '食費', '金額（円）': 1000 },
      { '大項目': '給料', '金額（円）': 5000 },
      { '大項目': '交通費', '金額（円）': -500 },
      { '大項目': '光熱費', '金額（円）': -1000 }
    ];
    
    const result = splitDataBySign(testData);
    
    expect(result.positiveTotal).toBe(6000);
    expect(result.negativeTotal).toBe(-1500);
    expect(result.positiveData.labels).toContain('食費');
    expect(result.positiveData.labels).toContain('給料');
    expect(result.negativeData.labels).toContain('交通費');
    expect(result.negativeData.labels).toContain('光熱費');
  });
  
  test('testAggregateDataByCategory runs without errors', () => {
    // コンソールログをモック化
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleAssertSpy = jest.spyOn(console, 'assert').mockImplementation();
    
    testAggregateDataByCategory();
    
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleAssertSpy).toHaveBeenCalled();
    
    // モックを元に戻す
    consoleLogSpy.mockRestore();
    consoleAssertSpy.mockRestore();
  });
});
