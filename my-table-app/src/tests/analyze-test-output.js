#!/usr/bin/env node
/* eslint-disable */
/**
 * テスト結果の分析スクリプト
 * 
 * テストの詳細な失敗理由を分析します
 * 
 * 使用方法:
 * node src/tests/analyze-test-output.js [テスト出力ファイル]
 */

const fs = require('fs');
const path = require('path');

// テスト出力ファイルを読み込む
const args = process.argv.slice(2);
const outputFile = args[0];

if (!outputFile) {
  console.error('テスト出力ファイルを指定してください');
  process.exit(1);
}

try {
  const content = fs.readFileSync(outputFile, 'utf8');
  analyzeTestOutput(content);
} catch (err) {
  console.error(`ファイルの読み込みに失敗しました: ${err.message}`);
  process.exit(1);
}

// テスト出力を分析する
function analyzeTestOutput(output) {
  console.log('=== テスト結果の分析 ===');
  
  // 失敗したテストを特定
  const failedTests = [];
  const failurePattern = /FAIL\s+(.*?)\n/g;
  let match;
  
  while ((match = failurePattern.exec(output)) !== null) {
    failedTests.push(match[1]);
  }
  
  console.log(`失敗したテスト: ${failedTests.length}件`);
  failedTests.forEach((test, i) => {
    console.log(`${i + 1}. ${test}`);
  });
  
  // エラーメッセージを抽出
  const errorMessages = [];
  const errorPattern = /●.*?\n\s+(.*?)\n\n/gs;
  
  while ((match = errorPattern.exec(output)) !== null) {
    errorMessages.push(match[1].trim());
  }
  
  console.log('\n=== エラーメッセージ ===');
  errorMessages.forEach((msg, i) => {
    console.log(`${i + 1}. ${msg}`);
  });
  
  // 推奨アクション
  console.log('\n=== 推奨アクション ===');
  
  if (output.includes('Unable to find an element with the text')) {
    console.log('- テキスト検索の方法を変更する（正規表現または部分一致を使用）');
  }
  
  if (output.includes('expect(jest.fn()).toHaveBeenCalledWith')) {
    console.log('- モック関数の呼び出し引数を確認する');
    console.log('- モックの設定方法を見直す');
  }
  
  if (output.includes('Unable to find an accessible element with the role')) {
    console.log('- getByRole の代わりに getAllByRole を使い、テキスト内容で絞り込む');
    console.log('- data-testid を追加してgetByTestId を使用する');
  }
}
