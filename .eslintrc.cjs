module.exports = {
	root: true,
  parser: '@typescript-eslint/parser',
	extends: ['plugin:svelte/recommended'],
	parserOptions: {
    project: 'tsconfig.json',
    extraFileExtensions: ['.svelte'],
		sourceType: 'module',
		ecmaVersion: 2019
	},
	overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
	ignorePatterns: ['*.cjs'],
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		"@typescript-eslint/ban-ts-comment": "off"
	}
};
