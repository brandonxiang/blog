/**
 * Generates WebP variants for the raster images referenced by blog posts.
 *
 * Posts embed screenshots that are far larger than the ~55rem column they are
 * displayed in, and the PNG/JPEG originals are expensive on the wire. This
 * script writes `<name>.<width>.webp` variants next to each original; the
 * markdown pipeline picks them up and emits a `<picture>` element with a
 * responsive `srcset`.
 *
 * Usage:
 *   pnpm images:optimize            # generate missing/changed variants
 *   pnpm images:optimize --force    # regenerate everything
 *
 * The generated files are committed, so a normal build never needs sharp.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const IMAGE_DIR = join(ROOT, 'static', 'img');

/** Widths to generate. The widest matches a 2x display of the content column. */
const WIDTHS = [640, 880, 1280, 1760];

/** Animated GIFs cannot be losslessly re-encoded, so they are left alone. */
const SUPPORTED = new Set(['.png', '.jpg', '.jpeg']);

/** Never re-encode something that is already smaller than a variant. */
const MIN_SAVINGS_RATIO = 0.9;

const force = process.argv.includes('--force');

/**
 * @param {string} dir
 * @returns {Promise<string[]>} Absolute paths of candidate images
 */
async function collectImages(dir) {
	const { readdir } = await import('node:fs/promises');
	const entries = await readdir(dir, { withFileTypes: true });

	/** @type {string[]} */
	const files = [];

	for (const entry of entries) {
		const path = join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await collectImages(path)));
		} else if (SUPPORTED.has(extname(entry.name).toLowerCase())) {
			files.push(path);
		}
	}

	return files;
}

/**
 * @param {Buffer} buffer
 * @returns {number}
 */
function originalBytes(buffer) {
	return buffer.byteLength;
}

async function main() {
	if (!existsSync(IMAGE_DIR)) {
		console.error(`No image directory at ${IMAGE_DIR}`);
		process.exit(1);
	}

	const images = await collectImages(IMAGE_DIR);
	let created = 0;
	let skipped = 0;
	/** @type {string[]} */
	const saved = [];

	for (const path of images) {
		const source = await readFile(path);
		const metadata = await sharp(source).metadata();
		const width = metadata.width;

		if (!width) {
			skipped += 1;
			continue;
		}

		const stem = basename(path, extname(path));

		for (const target of WIDTHS) {
			if (target >= width && target !== WIDTHS[WIDTHS.length - 1]) continue;
			if (target > width) continue;

			const out = join(dirname(path), `${stem}.${target}.webp`);

			if (!force && existsSync(out)) {
				continue;
			}

			const output = await sharp(source)
				.resize({ width: target, withoutEnlargement: true })
				.webp({ quality: 78, effort: 5 })
				.toBuffer();

			// A WebP that is not meaningfully smaller than the original is not
			// worth an extra request, so it is discarded.
			if (output.byteLength > originalBytes(source) * MIN_SAVINGS_RATIO && target >= width) {
				continue;
			}

			await writeFile(out, output);
			created += 1;
			saved.push(
				`${relative(ROOT, path)} -> ${relative(ROOT, out)} ` +
					`(${(originalBytes(source) / 1024).toFixed(0)}KB -> ${(output.byteLength / 1024).toFixed(0)}KB)`
			);
		}

		// The original resolution is worth keeping as the last resort.
		const fullOut = join(dirname(path), `${stem}.${width}.webp`);
		if ((force || !existsSync(fullOut)) && width > WIDTHS[WIDTHS.length - 1]) {
			const output = await sharp(source).webp({ quality: 78, effort: 5 }).toBuffer();
			await writeFile(fullOut, output);
			created += 1;
			saved.push(
				`${relative(ROOT, path)} -> ${relative(ROOT, fullOut)} ` +
					`(${(originalBytes(source) / 1024).toFixed(0)}KB -> ${(output.byteLength / 1024).toFixed(0)}KB)`
			);
		}
	}

	for (const line of saved) console.log(line);
	console.log(`\n${created} variant(s) written, ${skipped} image(s) skipped.`);
}

await main();
