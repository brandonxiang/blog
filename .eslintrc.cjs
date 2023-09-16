module.exports = {
	root: true,
	extends: ['plugin:svelte/recommended'],
	plugins: ['prettier-plugin-svelte'],
	parserOptions: {
		project: 'tsconfig.json',
		extraFileExtensions: ['.svelte'],
		sourceType: 'module',
		ecmaVersion: 2019
	},
	ignorePatterns: ['*.cjs'],
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'@typescript-eslint/ban-ts-comment': 'off'
	},
	settings: {
		svelte: {
			kit: {
				files: {
					routes: 'src/routes'
				}
			}
		}
	}
};
