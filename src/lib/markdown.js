import {readSync} from 'to-vfile';
import {unified} from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import frontmatter from 'remark-frontmatter';
import highlight from 'rehype-highlight';
import yaml from 'js-yaml';
import dayjs from 'dayjs';

const parser = unified().use(parse).use(gfm).use(frontmatter, ['yaml']);

const runner = unified().use(remark2rehype).use(highlight).use(rehypeStringify);

/**
 * 
 * @param {string} filename 
 * @returns {import('../interface/post.js').PostType}
 */
export function process(filename) {
	const slug = filename.split('.')[0];
	const tree = parser.parse(readSync(filename));
	/** @type {{date: string; title: string;}} */
	let metadata = {date: '', title: ''};

	if (tree.children.length > 0 && tree.children[0].type == 'yaml') {
		//@ts-ignore
		metadata = yaml.load(tree.children[0].value);
		tree.children = tree.children.slice(1, tree.children.length);
		metadata.date = dayjs(metadata.date).format('MMM D, YYYY');
	}
	const content = runner.stringify(runner.runSync(tree));
	return { metadata, content, slug };
}
