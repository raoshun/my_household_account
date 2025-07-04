#!/usr/bin/env node
/* eslint-disable */
/**
 * テストをデバッグモードで実行するためのスクリプト
 *
 * 使用方法:
 * node scripts/run-debug-test.js [テストファイルパターン] [--watch]
 *
 * 例:
 * node scripts/run-debug-test.js src/components/Charts.test.js --watch
 */

const { spawnSync } = require('child_process');
const path = require('path');

// コマンドライン引数を解析
const args = process.argv.slice(2);
const testFile = args.find(arg => !arg.startsWith('--')) || '';
const shouldWatch = args.includes('--watch');

console.log('===== テストデバッグ実行 =====');
console.log(`テストファイル: ${testFile || '全てのテスト'}`);
console.log(`監視モード: ${shouldWatch ? '有効' : '無効'}`);

// ファイルパスの確認にpathを使用
if (testFile && !require('fs').existsSync(path.resolve(process.cwd(), testFile))) {
  console.error(`Error: テストファイル "${testFile}" が見つかりません`);
  process.exit(1);
}

// テスト実行コマンドを構築
const command = 'npm';
const commandArgs = ['test'];

// テストファイルが指定されていれば追加
if (testFile) {
  commandArgs.push(testFile);
}

// 監視モードを設定
if (shouldWatch) {
  commandArgs.push('--', '--watch');
} else {
  commandArgs.push('--', '--watchAll=false');
}

// その他のオプションを追加
commandArgs.push('--verbose');
commandArgs.push('--detectOpenHandles');

// 環境変数を設定
const env = {
  ...process.env,
  TEST_DEBUG: 'true',
};

console.log(`実行コマンド: ${command} ${commandArgs.join(' ')}`);
console.log('=========================');

// コマンドを実行
const result = spawnSync(command, commandArgs, {
  stdio: 'inherit',
  env,
  shell: true,
});

// 終了コードを報告
if (result.status !== 0) {
  console.log(`テスト実行が失敗しました。終了コード: ${result.status}`);
}

process.exit(result.status);
