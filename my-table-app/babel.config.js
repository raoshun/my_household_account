module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
  env: {
    test: {
      plugins: [
        // テスト環境でのみ適用される設定
        ['@babel/plugin-transform-runtime', {
          regenerator: true
        }]
      ]
    }
  }
};
