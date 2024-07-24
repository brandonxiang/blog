import { getPosts } from '$lib/getPosts';
import dayjs from 'dayjs';

export const prerender = true;

const notionPosts = [
	{
		metadata: {
			date: 'Mar 8, 2024',
			title: '独立 app 技术栈'
		},
		redirect: 'https://brandonxiang.notion.site/app-5454570fee2c4750b297de7843ba2e09'
	},
	{
		metadata: {
			date: 'Mar 9, 2024',
			title: '学习前端的方法'
		},
		redirect: 'https://brandonxiang.notion.site/95d1342036604b66802fa4d66e1dd911'
	},
	{
		metadata: {
			date: 'Mar 10, 2024',
			title: '大前端技术路线'
		},
		redirect: 'https://brandonxiang.notion.site/32df21d29f4641dda400d9129569bf95'
	},
	{			
		metadata: {
			date: 'Mar 11, 2024',
			title: '全栈项目脚手架'
		},
		redirect: 'https://brandonxiang.notion.site/app-5454570fee2c4750b297de7843ba2e09'	
	}
	
]

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {

	let posts = getPosts();

	posts = posts.concat(notionPosts)
	// sort the posts by create date.
	// @ts-ignore
	posts.sort(
		(a, b) => +dayjs(b.metadata.date, 'MMM D, YYYY') - +dayjs(a.metadata.date, 'MMM D, YYYY')
	);

	return { posts };
};
