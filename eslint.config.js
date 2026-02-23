import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import skipFormatting from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsparser
			}
		},
		rules: {
			'prettier/prettier': 'off'
		}
	},
	{
		files: ['**/*.ts', '**/*.js'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				project: './tsconfig.json',
				sourceType: 'module',
				ecmaVersion: 2019
			},
			globals: {
				browser: true,
				node: true
			}
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			'@typescript-eslint/ban-ts-comment': 'off',
			'prettier/prettier': 'off'
		}
	},
	{
		ignores: ['*.cjs', 'node_modules', 'dist', 'build', '.svelte-kit']
	}
];
