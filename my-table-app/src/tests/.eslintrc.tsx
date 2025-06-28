/* eslint-disable */
module.exports = {
  env: {
    node: true,
    jest: true
  },
  globals: {
    require: true,
    process: true,
    module: true,
    jest: true,
    describe: true,
    test: true,
    expect: true,
    beforeAll: true,
    beforeEach: true,
    afterAll: true,
    afterEach: true
  },
  parserOptions: {
    sourceType: "script",
    ecmaVersion: 2020
  },
  rules: {
    "no-undef": "off",
    "import/no-commonjs": "off",
    "no-unused-vars": ["warn", {
      "argsIgnorePattern": "^(_|e|error)",
      "varsIgnorePattern": "^(_|path)"
    }]
  }
};
