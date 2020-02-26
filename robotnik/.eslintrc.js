module.exports = {
  plugins: [
    "@typescript-eslint",
    "prettier",
  ],
  extends: [
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json"
  },
  env: {
    node: true,
  },
  plugins: ['@typescript-eslint'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
  },
  rules: {
    // Use 2 spaces indentation
    '@typescript-eslint/indent': ["error", 2],
    
    // No errors on using devDependencies in tests
    "import/no-extraneous-dependencies": [ 
      "error", {
        "devDependencies": [
          "**/*.test.ts"
        ]
      }
    ]
  },
}