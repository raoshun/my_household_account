/* eslint-disable */
module.exports = {
  env: {
    node: true
  },
  parserOptions: {
    sourceType: "script",
    ecmaVersion: 2020
  },
  globals: {
    __dirname: "readonly",
    __filename: "readonly",
    module: "readonly",
    require: true,
    process: true,
    console: true
  },
  rules: {
    "no-console": "off",
    "import/no-commonjs": "off"
  }
};
