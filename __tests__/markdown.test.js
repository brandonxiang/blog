import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { process } from '../src/lib/markdown.js';

/** @type {string[]} */
let tempDirs = [];

afterEach(() => {
	for (const dir of tempDirs) {
		rmSync(dir, { recursive: true, force: true });
	}
	tempDirs = [];
});

/**
 * @param {string} content
 */
function writeMarkdown(content) {
	const dir = mkdtempSync(join(tmpdir(), 'blog-markdown-test-'));
	const filename = join(dir, 'sample.md');
	tempDirs.push(dir);
	writeFileSync(filename, content);
	return filename;
}

describe('process', () => {
	it('extracts YAML metadata, formats the date, and renders markdown content', () => {
		const filename = writeMarkdown(`---
title: Test Post
date: 2026-05-13
description: Short [description](https://example.com) with \`code\` and **bold** text
---
# Hello Markdown

This is **bold** text.

## Section One

### Details with \`code\`

## Section One

- [x] shipped
`);

		const post = process(filename);

		expect(post.metadata).toEqual({
			title: 'Test Post',
			date: 'May 13, 2026',
			description: 'Short description with code and bold text'
		});
		expect(post.slug).toBe(filename.split('.')[0]);
		expect(post.content).toContain('<h1>Hello Markdown</h1>');
		expect(post.content).toContain('<h2 id="section-one">Section One</h2>');
		expect(post.content).toContain(
			'<h3 id="details-with-code">Details with <code>code</code></h3>'
		);
		expect(post.content).toContain('<h2 id="section-one-2">Section One</h2>');
		expect(post.content).toContain('<strong>bold</strong>');
		expect(post.content).not.toContain('title: Test Post');
		expect(post.toc).toEqual([
			{ depth: 2, text: 'Section One', id: 'section-one' },
			{ depth: 3, text: 'Details with code', id: 'details-with-code' },
			{ depth: 2, text: 'Section One', id: 'section-one-2' }
		]);
	});

	it('returns empty metadata defaults when a post has no frontmatter', () => {
		const filename = writeMarkdown(`## Plain post

No metadata here.
`);

		const post = process(filename);

		expect(post.metadata).toEqual({ date: '', title: '' });
		expect(post.toc).toEqual([{ depth: 2, text: 'Plain post', id: 'plain-post' }]);
		expect(post.content).toContain('<h2 id="plain-post">Plain post</h2>');
		expect(post.content).toContain('<p>No metadata here.</p>');
	});

	it('derives the category from the directory holding the post', () => {
		const root = join(mkdtempSync(join(tmpdir(), 'blog-markdown-test-')), 'posts');
		tempDirs.push(join(root, '..'));

		for (const [category, expected] of [
			['framework', 'Framework'],
			['ai', 'AI'],
			['pwa', 'PWA'],
			['unknown-dir', 'Blog']
		]) {
			const nested = join(root, category);
			mkdirSync(nested, { recursive: true });
			const filename = join(nested, 'post.md');
			writeFileSync(filename, '---\ntitle: Post\ndate: 2026-05-13\n---\n');

			expect(process(filename).category).toBe(expected);
		}
	});

	it('keeps h1 headings out of the table of contents and slugs non-latin headings', () => {
		const filename = writeMarkdown(`# 前言

## 你好 World!

### 100% Done

#### Too deep
`);

		const post = process(filename);

		expect(post.toc).toEqual([
			{ depth: 2, text: '你好 World!', id: '你好-world' },
			{ depth: 3, text: '100% Done', id: '100-done' }
		]);
	});
});
