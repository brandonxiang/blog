import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite-plus';

const config = defineConfig({
	plugins: [
		sveltekit({
			paths: {
				relative: false
			},
			adapter: adapter()
		})
	],
	fmt: {
		useTabs: true,
		singleQuote: true,
		trailingComma: 'none',
		printWidth: 100,
		sortPackageJson: false,
		ignorePatterns: ['.svelte-kit/**', 'static/**', 'build/**', 'node_modules/**']
	}
});

export default config;
