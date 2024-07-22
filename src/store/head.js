import { writable } from 'svelte/store';

const pageInfoStore = writable({
  title: 'Brandonxiang Blog',
  keywords: 'brandon,blog,frontend,ai,web3,web,develop,code,study,keynote,大前端从入门到跑路,大前端,前端技术,学习',
  description: 'Here is Brandon\'s Blog,how to learn web developing, deep in web3, working in advanced technology',
  url: 'https://brandonxiang.top'
});

export default pageInfoStore

