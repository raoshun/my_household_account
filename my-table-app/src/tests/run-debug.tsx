#!/usr/bin/env node
/* eslint-disable */
/**
 * テストのデバッグ実行をサポートするスクリプト
 * 
 * 使用方法:
 * node src/tests/run-debug.js [テストファイルパス] [--watch] [--verbose]
 * 
 * 例:
 * node src/tests/run-debug.js src/components/Charts.test.js --watch --verbose
 */

// Node.jsスクリプトは scripts/ ディレクトリに移動しました。
// このファイルはフロントエンドビルドから除外するため、内容をコメントアウトしています。
// const { spawn } = require('child_process');
// const path = require('path');
// const fs = require('fs');

// // コマンドライン引数の処理
// const args = process.argv.slice(2);
// let testPath = null;
// const flags = [];

// // 引数からテストパスとフラグを分離
// args.forEach(arg => {
//   if (arg.startsWith('--')) {
//     flags.push(arg);
//   } else if (!testPath) {
//     testPath = arg;
//   }
// });

// // テストファイルの存在確認
// if (testPath && !fs.existsSync(path.resolve(process.cwd(), testPath))) {
//   console.error(`Error: テストファイル "${testPath}" が見つかりません。`);
//   process.exit(1);
// }

// // React Scriptsのテスト実行コマンドを構築
// const reactScriptsPath = path.resolve(process.cwd(), 'node_modules', '.bin', 'react-scripts');
// const cmd = reactScriptsPath;
// const cmdArgs = ['test'];

// // テストファイルを指定
// if (testPath) {
//   cmdArgs.push(testPath);
// }

// // フラグを追加
// if (flags.includes('--watch')) {
//   cmdArgs.push('--watch');
// }

// if (flags.includes('--verbose')) {
//   cmdArgs.push('--verbose');
// }

// if (flags.includes('--coverage')) {
//   cmdArgs.push('--coverage');
// }

// // 常にデバッグモードを有効化
// const env = { ...process.env, TEST_DEBUG: 'true' };

// // コマンド実行の詳細を表示
// console.log(`実行コマンド: ${cmd} ${cmdArgs.join(' ')}`);
// console.log('デバッグモード: 有効');
// console.log('---');

// // テスト実行
// const child = spawn(cmd, cmdArgs, { 
//   stdio: 'inherit', 
//   env,
//   shell: true 
// });

// // プロセスのイベント処理
// child.on('error', (error) => {
//   console.error(`テスト実行エラー: ${error.message}`);
// });

// child.on('exit', (code) => {
//   if (code !== 0) {
//     console.log(`テスト実行が終了しました。終了コード: ${code}`);
//   }
// });
