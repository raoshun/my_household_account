/* eslint-disable */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true
  },
  globals: {
    globalThis: true,
    process: true,
    jest: true,
    describe: true,
    test: true,
    expect: true,
    beforeEach: true,
    beforeAll: true,
    afterEach: true,
    afterAll: true,
    module: true,
    require: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'jest'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': ['warn', { 
      "argsIgnorePattern": "^(error|e|_)",
      "varsIgnorePattern": "^_"
    }],
    "import/no-commonjs": "off"
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ["*.test.js", "*.spec.js", "**/__tests__/**/*.js", "**/tests/**/*.js", "**/test-utils/**/*.js"],
      env: {
        jest: true,
        node: true
      },
      rules: {
        "no-undef": "off"
      }
    },
    {
      files: ["jest.config.js", ".eslintrc.js", "jest.setup*.js", "**/*.config.js"],
      env: {
        node: true
      },
      rules: {
        "no-undef": "off"
      }
    }
  ]
};