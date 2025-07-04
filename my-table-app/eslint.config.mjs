import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'no-undef': 'off',
    },
  },
  // TypeScriptファイルに対する特別なルール設定
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      'no-undef': 'off', // TypeScriptファイルでは型定義を考慮してno-undefを無効化
    },
  },
  // テストファイルに対する特別なルール設定
  {
    files: ["**/*.test.{js,ts,jsx,tsx}", "**/__tests__/**/*.{js,ts,jsx,tsx}"],
    rules: {
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];