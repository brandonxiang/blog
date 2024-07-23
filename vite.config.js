import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			strategies: 'generateSW',
			injectRegister: 'inline',
			registerType: 'autoUpdate',
			srcDir: './src',
			manifest: {
				"background_color": "#ffffff",
				"theme_color": "#333333",
				"name": "Brandon's Blog",
				"short_name": "Brandon's Blog",
				"description": "A Web Developer's Blog",
				"display": "standalone",
				"start_url": "/",
				"scope": "/",
				"icons": [
					{
						"src": "icon/logo-192.png",
						"sizes": "192x192",
						"type": "image/png"
					},
					{
						"src": "icon/logo-512.png",
						"sizes": "512x512",
						"type": "image/png"
					}
				],
				"share_target": {
					"action": "compose/share",
					"params": {
						"title": "title",
						"text": "text",
						"url": "url"
					},
					"method": "GET",
					"enctype": "application/x-www-form-urlencoded"
				},
				"prefer_related_applications": false
			},
		})
	]
};

export default config;
