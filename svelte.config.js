import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		paths: {
			relative: false
		},
		adapter: adapter()
	}
};

export default config;
