# 家計簿分析アプリ

## 概要

Money Forwardのcsvファイルを読み込み、家計簿の分析を行うアプリケーションです。  
家計簿の分析結果をグラフで表示し、家計簿の分析を行うことができます。  

## 機能

- Money Forwardのcsvファイルを読み込み、家計簿の分析を行う
- 家計簿の分析結果をグラフで表示する
- データのソート機能
- カテゴリ別の集計機能

## 開発予定の機能

- 家計簿の分析結果をcsvファイルで出力する
- 生成AIによる家計簿のフィードバック
- 支出のカテゴリ4分法による分析
- 分類誤りの抽出

## 開発方法

### 環境構築

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/my_household_account_book.git
cd my_household_account_book

# 依存関係のインストール
cd my-table-app
npm install
```

### 開発サーバーの起動

```bash
cd my-table-app
npm start
```

### テストの実行

```bash
# すべてのテストを実行
cd my-table-app
npm test

# 特定のテストファイルを実行
npm test -- src/utils/sortData.test.js

# カバレッジレポートを生成
npm run test:coverage
```