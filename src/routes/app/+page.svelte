<script>
	let apps = [
		{
			title: 'brandon notion',
			url: "https://brandonxiang.notion.site/brandonxiang-notion-078346416d174cb0bf79e0023ef7d8af",
			description: '不知名前端notion笔记',
		},
		{
			title: 'pwaland',
			url: 'https://pwaland.brandonxiang.top/',
			description: 'PWA应用推荐网站'
		},
    {
			title: 'pb to typescript',
			url: 'https://pb.brandonxiang.top/',
			description: 'Protobuffer转typescript类型定义文件'
		},
		{
			title: 'vueleaflet',
			url: 'https://vueleaflet.brandonxiang.top/',
			description: 'leaflet兼容vue3的老牌组件封装库'
		},
		{
			title: 'wgis-kit',
			url: 'https://wgis.brandonxiang.top/',
			description: 'webgis的老牌封装工具库'
		},
		{
			title: 'svelteup',
			url: 'https://svelteup.brandonxiang.top',
			description: 'web component + svelte + esbuild = svelteup'
		},
		{
			title: 'FolderBsdp',
			url: 'https://github.com/peichen3141/FolderBsdp',
			description: '一种改良过后的bsdp差分算法'
		},
		{
			title: 'babel-plugin-react-native-style-adaptation',
			url: 'https://github.com/kukudeshiyi/babel-plugin-react-native-style-adaptation',
			description: 'react native 样式适配神器'
		}, 
		{
			title: 'ts-unused-exports',
			url: 'https://github.com/pzavolinsky/ts-unused-exports',
			description: '文件、代码 exports 剪枝神器'
		},
		{
			title: 'i18n-shaking',
			url: 'https://github.com/kukudeshiyi/i18n-shaking',
			description: '基于语法树的 i18n 剪枝神器'
		},
		{
			title: 'vite-antd-starter',
			url: 'https://github.com/brandonxiang/vite-antd-starter',
			description: '极简的 vite + antd 初始化模版'
		},
		{
			title: 'vite-antd-mobile-starter',
			url: 'https://github.com/brandonxiang/vite-antd-mobile-starter',
			description: '极简的 vite + antd-mobile 初始化模版'
		},
		{
			title: 'nextjs-antd-starter',
			url: 'https://github.com/brandonxiang/nextjs-antd-starter',
			description: '极简的 nextjs + antd-mobile 初始化模版'
		},
		{
			title: 'geojson-python-utils',
			url: 'https://github.com/brandonxiang/geojson-python-utils',
			description: 'geojson 通用方法 python 实现'
		},
		{
			title: 'psm',
			url: 'https://github.com/brandonxiang/psm',
			description: 'python 换源工具'
		},
	];
</script>

<svelte:head>
	<title>Keynote</title>
</svelte:head>

<h1>App Recommend</h1>

<div>
	{#each apps as app, index}
		<p data-sveltekit-prefetch><a href={app.url} target="_blank">{app.title}</a></p>
		<div class="post-item-footer">
			<span class="post-item-date">— {app.description}</span>
		</div>
	{/each}
</div>

<style>
	.post-item-footer {
		font-family: Rubik, sans-serif;
		font-weight: 700;
	}

	.post-item-date {
		color: #aaa;
		text-align: left;
		text-transform: uppercase;
		margin-right: 16px;
	}
</style>
