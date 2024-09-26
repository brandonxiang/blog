import { getPostContent, getPosts } from "$lib/getPosts";
import dayjs from "dayjs";
import { Feed } from "feed";

export const prerender = true;

const author = {
  name: "Brandon Xiang",
  email: "brandonxiang.xiang@shopee.com",
  link: "https://brandonxiang.top/",
};

export async function GET() {
  const feed = new Feed({
    title: "Brandonxiang Blog",
    description: "Here is Brandon\'s Blog,how to learn web developing, deep in web3, working in advanced technology",
    id: "https://brandonxiang.top/",
    link: "https://brandonxiang.top/",
    language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    favicon: "https://brandonxiang.top/favicon.ico",
    copyright: `Copyright ${new Date().getFullYear().toString()}, brandonxiang`,
    generator: "🍉", // optional, default = 'Feed for Node.js'
    feedLinks: {
      rss: "https://brandonxiang.top/rss.xml",
    },
    author,
    ttl: 60,
  });
  const articles = getPosts();

  articles.sort(
		(a, b) => +dayjs(b.metadata.date, 'MMM D, YYYY') - +dayjs(a.metadata.date, 'MMM D, YYYY')
	)

  for (const article of articles) {
    feed.addItem({
      title: article.metadata.title,
      description: article.metadata.description,
      content: getPostContent(article?.slug || '').content,
      link: `https://brandonxiang.top/blog/${article.slug}`,
      author: [
        author,
      ],
      date: new Date(article.metadata.date),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}