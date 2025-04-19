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

### 前提条件

このプロジェクトはNode.jsとnpmを使用します。インストールされていない場合は、以下の手順でインストールしてください。

#### Node.jsとnpmのインストール

##### Ubuntu/Debian系

```bash
# apt を使用してインストール
sudo apt update
sudo apt install nodejs npm

# バージョン確認
node -v
npm -v
```

##### Red Hat/Fedora系

```bash
# dnf を使用してインストール
sudo dnf install nodejs npm

# バージョン確認
node -v
npm -v
```

##### macOS

[Node.js公式サイト](https://nodejs.org/)からインストーラーをダウンロードしてインストールするか、Homebrewを使用します。

```bash
# Homebrewを使用する場合
brew install node

# バージョン確認
node -v
npm -v
```

##### Windows

[Node.js公式サイト](https://nodejs.org/)からインストーラーをダウンロードしてインストールするか、chocolateyを使用します。

```powershell
# chocolateyを使用する場合
choco install nodejs

# バージョン確認
node -v
npm -v
```

### 環境構築

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/my_household_account_book.git
cd my_household_account_book

# 必要な依存関係をインストール（重要）
npm install
cd my-table-app
npm install

# 開発サーバーを起動する前に依存関係がインストールされていることを確認
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

## Visual Studio Codeでの開発

このプロジェクトはVS Code向けに最適化されており、開発環境のセットアップを容易にするための設定が含まれています。

### 推奨拡張機能

プロジェクトを初めて開いたとき、VS Codeは推奨拡張機能をインストールするよう提案します。以下の拡張機能がお勧めです：

- ESLint - JavaScriptコード解析
- Prettier - コードフォーマッター
- Jest - テスト実行とデバッグ
- Python - Pythonの言語サポート
- Pylance - Pythonの高度な機能
- Docker - コンテナ管理
- npm Intellisense - npm モジュールのインポート補完
- Import Cost - インポートのサイズ表示
- GitLens - Gitの統合機能強化
- Auto Rename Tag - HTML/JSXタグの自動リネーム
- Code Spell Checker - スペルチェック
- GitHub Copilot - AIによるコード補完（オプション）

### VS Codeタスクの実行

VS Codeでは、以下のタスクが設定されており、簡単に実行できます：

1. **Reactアプリの開発サーバー起動**
   - メニュー: `Terminal > Run Task...` を選択
   - `react-app-start` を選択

2. **Reactアプリのビルド**
   - メニュー: `Terminal > Run Task...` を選択
   - `react-app-build` を選択

3. **Python APIサーバーの起動**
   - メニュー: `Terminal > Run Task...` を選択
   - `python-api-server` を選択

4. **フルスタック開発環境の起動**（ReactアプリとAPIサーバーを同時に起動）
   - メニュー: `Terminal > Run Task...` を選択
   - `fullstack-dev` を選択
   
または、キーボードショートカット `Ctrl+Shift+P`（macOSでは `Cmd+Shift+P`）を押して、「Tasks: Run Task」と入力し、実行したいタスクを選択することもできます。

### デバッグ

VS Codeでは、以下のデバッグ構成が設定されています：

1. **Reactアプリのデバッグ**
   - デバッグビュー（`Ctrl+Shift+D` または `Cmd+Shift+D`）を開く
   - `Launch React App` を選択して実行

2. **テストのデバッグ**
   - デバッグビュー（`Ctrl+Shift+D` または `Cmd+Shift+D`）を開く
   - `Node: Debug Current Test` または `Node: Debug All Tests` を選択

3. **APIサーバーのデバッグ**
   - デバッグビュー（`Ctrl+Shift+D` または `Cmd+Shift+D`）を開く
   - `Python: API Server` を選択

4. **フルスタック環境のデバッグ**
   - デバッグビュー（`Ctrl+Shift+D` または `Cmd+Shift+D`）を開く
   - `Full Stack: API + React` を選択

### その他のVS Code設定

プロジェクトにはカスタム設定が含まれており、以下の機能が有効になっています：

- ESLintとPrettierの自動フォーマット
- 保存時のフォーマット適用
- テスト実行環境の最適化
- npm依存関係の自動検出
- ファイル検索の最適化

## トラブルシューティング

### `react-scripts: not found` エラー

以下のようなエラーが表示される場合：

```
sh: 1: react-scripts: not found
npm ERR! Lifecycle script `start` failed with error:
npm ERR! Error: command failed
```

**原因**: 依存関係が正しくインストールされていません。

**解決方法**: プロジェクトディレクトリでnpm installを実行します。

```bash
# ルートディレクトリで実行
npm install

# my-table-appディレクトリで実行
cd my-table-app
npm install
```

### huskyのインストールエラー

```
sh: 1: husky: not found
npm ERR! code 127
```

**原因**: Gitフック用のhuskyパッケージがインストールされていません。

**解決方法**: ルートディレクトリでhuskyをインストールします。

```bash
cd /path/to/my_household_account
npm install husky --save-dev
```

### VS Codeタスクが表示されない

**原因**: VS Codeの設定ファイルが正しく読み込まれていない可能性があります。

**解決方法**: 以下の手順を試してください。

1. VS Codeを再起動する
2. コマンドパレット（`Ctrl+Shift+P` または `Cmd+Shift+P`）を開き、「Reload Window」を実行
3. プロジェクトのルートフォルダを開いていることを確認する