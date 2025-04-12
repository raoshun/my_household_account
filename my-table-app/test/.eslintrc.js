/* eslint-disable */
module.exports = {
  env: {
    jest: true,
    browser: true,
    node: true
  },
  globals: {
    jest: true,
    expect: true,
    describe: true,
    test: true,
    it: true,
    beforeEach: true,
    afterEach: true,
    beforeAll: true,
    afterAll: true,
    process: true,
    global: true,
    globalThis: true
  },
  rules: {
    'no-unused-vars': ['warn', {
      'argsIgnorePattern': '^(error|e|_)',
      'varsIgnorePattern': '^_'
    }]
  }
};
