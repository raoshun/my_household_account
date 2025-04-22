/**
 * カバレッジが低いファイルを特定するスクリプト
 * 
 * このスクリプトは coverage/coverage-summary.json を読み込み、
 * カバレッジが閾値未満のファイルを表示します。
 */

const fs = require('fs');
const path = require('path');

// カバレッジレポートのパス
const coverageSummaryPath = path.join(__dirname, '../coverage/coverage-summary.json');

// カバレッジ閾値の設定
const THRESHOLD = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100
};

// 最低値の調整（0〜10%）
const MIN_COVERAGE = 10;

// カバレッジレポートの読み込み
try {
  const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
  
  console.log('==================================================================');
  console.log('             カバレッジが低いファイルのレポート                   ');
  console.log('==================================================================');
  
  // 結果を格納する配列
  const lowCoverageFiles = [];
  
  // 各ファイルのカバレッジをチェック
  Object.keys(coverageData).forEach(filePath => {
    // totalはスキップ
    if (filePath === 'total') return;
    
    const coverage = coverageData[filePath];
    
    // カバレッジが閾値未満かチェック
    const isBelowThreshold = 
      coverage.statements.pct < THRESHOLD.statements ||
      coverage.branches.pct < THRESHOLD.branches ||
      coverage.functions.pct < THRESHOLD.functions ||
      coverage.lines.pct < THRESHOLD.lines;
    
    // カバレッジが最低値以上の場合のみ表示（0%は除外）
    const isAboveMinimum = 
      coverage.statements.pct >= MIN_COVERAGE ||
      coverage.branches.pct >= MIN_COVERAGE ||
      coverage.functions.pct >= MIN_COVERAGE ||
      coverage.lines.pct >= MIN_COVERAGE;
    
    if (isBelowThreshold && isAboveMinimum) {
      // 相対パスに変換
      const relativePath = filePath.replace(/^.*\/src\//, 'src/');
      
      lowCoverageFiles.push({
        path: relativePath,
        statements: coverage.statements.pct,
        branches: coverage.branches.pct,
        functions: coverage.functions.pct,
        lines: coverage.lines.pct,
        // 平均カバレッジを計算
        average: (
          coverage.statements.pct + 
          coverage.branches.pct + 
          coverage.functions.pct + 
          coverage.lines.pct
        ) / 4
      });
    }
  });
  
  // 平均カバレッジでソート
  lowCoverageFiles.sort((a, b) => a.average - b.average);
  
  // 結果を表示
  if (lowCoverageFiles.length === 0) {
    console.log('すべてのファイルが閾値を満たしています！');
  } else {
    console.log(`カバレッジが閾値（${THRESHOLD.statements}%）未満のファイル数: ${lowCoverageFiles.length}`);
    console.log('優先度順（低カバレッジ順）:\n');
    
    console.log('| ファイルパス | ステートメント | ブランチ | 関数 | 行 | 平均 |');
    console.log('|------------|--------------|---------|------|-----|------|');
    
    lowCoverageFiles.forEach(file => {
      console.log(
        `| ${file.path} | ${file.statements.toFixed(2)}% | ${file.branches.toFixed(2)}% | ${file.functions.toFixed(2)}% | ${file.lines.toFixed(2)}% | ${file.average.toFixed(2)}% |`
      );
    });
  }
  
  console.log('\nヒント: カバレッジが低いファイルのテストを優先的に強化しましょう。');
  console.log('==================================================================');
  
} catch (error) {
  console.error('エラー: カバレッジレポートの読み込みに失敗しました');
  console.error('npm run test:coverage を先に実行してください');
  console.error(error);
  process.exit(1);
}