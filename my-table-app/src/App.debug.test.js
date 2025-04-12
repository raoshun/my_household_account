/* eslint-disable */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from '@jest/globals';
import App from './App';
import { dumpDOM, logAllRoles, debugButtons, findElementsByAttribute } from './test-utils/test-debug';

// デバッグ専用のテストケース
describe('App Debug Tests', () => {
  // UIコンポーネントの構造を表示するテスト
  test('UIコンポーネントの構造を確認', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // レンダリング結果全体を表示
    dumpDOM(screen);
    
    // 使用可能なロールを表示
    logAllRoles(screen);
    
    // ボタンを検索
    debugButtons(screen);
    
    // 特定の属性を持つ要素を検索
    findElementsByAttribute(screen, 'data-testid');
    
    // ダミーアサーションを追加してテストを通過させる
    expect(true).toBe(true);
  });

  // 表ボタンのクリックをデバッグするテスト
  test('表ボタンクリックのデバッグ', async () => {
    await act(async () => {
      render(<App />);
    });
    
    console.log('=== 表ボタンの検索 ===');
    
    // 様々な方法でボタンを検索してみる
    try {
      const buttonByText = screen.getByText('表');
      console.log('getByText("表") で見つかりました:', buttonByText);
    } catch (_) {
      console.log('getByText("表") では見つかりませんでした');
    }
    
    try {
      const buttonByRegex = screen.getByText(/表$/);
      console.log('getByText(/表$/) で見つかりました:', buttonByRegex);
    } catch (_) {
      console.log('getByText(/表$/) では見つかりませんでした');
    }
    
    try {
      const buttonByEmoji = screen.getByText(/📋/);
      console.log('getByText(/📋/) で見つかりました:', buttonByEmoji);
    } catch (_) {
      console.log('getByText(/📋/) では見つかりませんでした');
    }
    
    try {
      const buttonByRole = screen.getByRole('button', { name: /表/ });
      console.log('getByRole("button", { name: /表/ }) で見つかりました:', buttonByRole);
    } catch (_) {
      console.log('getByRole("button", { name: /表/ }) では見つかりませんでした');
    }
    
    try {
      const buttonByFullEmoji = screen.getByText(/📋 表/);
      console.log('getByText(/📋 表/) で見つかりました:', buttonByFullEmoji);
    } catch (_) {
      console.log('getByText(/📋 表/) では見つかりませんでした');
    }
    
    try {
      const buttonByRoleWithEmoji = screen.getByRole('button', { name: /📋 表/ });
      console.log('getByRole("button", { name: /📋 表/ }) で見つかりました:', buttonByRoleWithEmoji);
      
      // 成功したらクリックしてみる
      await act(async () => {
        userEvent.click(buttonByRoleWithEmoji);
      });
      
      // 表示が切り替わったか確認
      const chartsElement = screen.queryByTestId('mock-charts');
      console.log('チャート要素が非表示になったか:', chartsElement === null);
    } catch (_) {
      console.log('getByRole("button", { name: /📋 表/ }) では見つかりませんでした');
    }
    
    // ダミーアサーションを追加してテストを通過させる
    expect(true).toBe(true);
  });
});
