<script>
	let keynotes = [
		{
			title: '微服务实战之BFF云端一体开发实战',
			url: 'https://keynote.brandonxiang.top/bff.html',
			date: 'Feb 10, 2023'
		},
		{
			title: 'nodejs服务的技术运维',
			url: 'https://keynote.brandonxiang.top/devops.html',
			date: 'Feb 10, 2023'
		},
		{
			title: 'nodejs包管理器的前世今生',
			url: 'https://keynote.brandonxiang.top/devops.html',
			date: 'Jan 31, 2023'
		},
		{
			title: '如何清除项目中没用代码',
			url: 'https://keynote.brandonxiang.top/remove-unused-files.html',
			date: 'Jan 06, 2023'
		},
		{
			title: '前端测试左移',
			url: 'https://keynote.brandonxiang.top/shift-left-testing.html',
			date: 'Aug 03, 2022'
		},
		{
			title: '如何做好一个技术分享、技术方案、答辩',
			url: 'https://keynote.brandonxiang.top/speech.html',
			date: 'Jan 07, 2021'
		},
		{
			title: '前端项目架构设计',
			url: 'https://keynote.brandonxiang.top/aroom.html',
			date: 'Nov 12, 2021'
		},
		{
			title: '学习前端的方法',
			url: 'https://keynote.brandonxiang.top/how-to-learn-fe.html',
			date: 'AUG 06, 2021'
		},
		{
			title: '使用Next.js实现优雅降级',
			url: 'https://keynote.brandonxiang.top/nextjs-fallback.html',
			date: 'JUN 12, 2021'
		},
		{
			title: '如何参与一个开源项目',
			url: 'https://keynote.brandonxiang.top/github.html',
			date: 'APR 17, 2021'
		},
		{
			title: 'Monorepo',
			url: 'https://keynote.brandonxiang.top/monorepo.html',
			date: 'MAR 05, 2021'
		},
		{
			title: 'Incremental Static Regeneration',
			url: 'https://keynote.brandonxiang.top/isr.html',
			date: 'NOV 13, 2020'
		},
		{
			title: 'ESM Import & Bundle Free',
			url: 'https://keynote.brandonxiang.top/bundle-free.html',
			date: 'AUG 14, 2020'
		},
		{
			title: 'Svelte 入门',
			url: 'https://keynote.brandonxiang.top/svelte.html',
			date: 'Aug 16, 2019'
		},
		{
			title: 'React-Navigation和Expo的应用',
			url: 'https://keynote.brandonxiang.top/expo.html',
			date: 'MAR 31, 2019'
		},
		{
			title: '微前端与Web Components',
			url: 'https://keynote.brandonxiang.top/microfrontend.html',
			date: 'APR 02, 2019'
		},
		{
			title: '小程序开发实战',
			url: 'https://keynote.brandonxiang.top/weapp.html',
			date: 'NOV 26, 2018'
		},
		{
			title: 'PWA开发实战',
			url: 'https://keynote.brandonxiang.top/pwa.html',
			date: 'NOV 26, 2018'
		},
		{
			title: 'Vue-cli3.0',
			url: 'https://keynote.brandonxiang.top/vue-cli.html',
			date: 'OCT 18, 2018'
		},
		{
			title: 'Vue单元测试',
			url: 'https://keynote.brandonxiang.top/vue-test.html',
			date: 'NOV 08, 2018'
		},
		{
			title: 'Vue开发规范',
			url: 'https://keynote.brandonxiang.top/vue-specification.html',
			date: 'OCT 12, 2017'
		},
		{
			title: 'Vue技术选型与Webpack入门',
			url: 'https://keynote.brandonxiang.top/vue-startup.html',
			date: 'JUN 09, 2017'
		}
	];
</script>

<svelte:head>
	<title>Keynote</title>
</svelte:head>

<h1>Recent Slides</h1>

<div>
	{#each keynotes as keynote, index}
		<p data-sveltekit-prefetch><a href={keynote.url} target="_blank">{keynote.title}</a></p>
		<div class="post-item-footer">
			<span class="post-item-date">— {keynote.date}</span>
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
