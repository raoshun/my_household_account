/* eslint-disable */
module.exports = {
  env: {
    browser: true,
    jest: true
  },
  rules: {
    'no-unused-vars': ['warn', { 
      "argsIgnorePattern": "^(error|e|_)",
      "varsIgnorePattern": "^_"
    }]
  }
};
