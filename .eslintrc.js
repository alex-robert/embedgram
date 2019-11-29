module.exports = {
  root: true,
  env: {
    es6: true,
    'jest/globals': true
  },
  plugins: ['jest'],
  extends: [
    'standard'
  ],
  rules: {
    'no-console': 'error'
  }
}
