import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { process } from './markdown.js';

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
description: Short description
---
# Hello Markdown

This is **bold** text.

- [x] shipped
`);

		const post = process(filename);

		expect(post.metadata).toEqual({
			title: 'Test Post',
			date: 'May 13, 2026',
			description: 'Short description'
		});
		expect(post.slug).toBe(filename.split('.')[0]);
		expect(post.content).toContain('<h1>Hello Markdown</h1>');
		expect(post.content).toContain('<strong>bold</strong>');
		expect(post.content).not.toContain('title: Test Post');
	});

	it('returns empty metadata defaults when a post has no frontmatter', () => {
		const filename = writeMarkdown(`## Plain post

No metadata here.
`);

		const post = process(filename);

		expect(post.metadata).toEqual({ date: '', title: '' });
		expect(post.content).toContain('<h2>Plain post</h2>');
		expect(post.content).toContain('<p>No metadata here.</p>');
	});
});
