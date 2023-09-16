<script>
	let apps = [
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
			title: 'FolderBsdp',
			url: 'https://github.com/peichen3141/FolderBsdp',
			description: '一种改良过后的bsdp差分算法'
		},
		{
			title: 'psm',
			url: 'https://github.com/brandonxiang/psm',
			description: 'python换源工具'
		}
	];
</script>

<svelte:head>
	<title>Keynote</title>
</svelte:head>

<h1>应用推荐</h1>

<div>
	{#each apps as app, index}
		<p data-sveltekit-prefetch><a href={app.url}>{app.title}</a></p>
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
