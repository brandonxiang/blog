/**
 * Submits every URL in the sitemap to the IndexNow protocol.
 *
 * IndexNow is the notification endpoint shared by Bing, Yandex, Naver,
 * Seznam and — through Copilot — part of the answer-engine surface. Without it
 * a crawler only finds new posts when it happens to recrawl, which on a
 * low-traffic personal blog can take weeks.
 *
 * Usage:
 *   INDEXNOW_KEY=<key> node scripts/indexnow.mjs
 *
 * The key must match the file served at `https://brandonxiang.top/<key>.txt`.
 * Create it with `openssl rand -hex 16` and commit it to `static/`.
 *
 * The endpoint allows batches of 10,000 URLs per request.
 */

const SITE_URL = process.env.SITE_URL ?? 'https://brandonxiang.top';
const KEY = process.env.INDEXNOW_KEY;
const ENDPOINT = process.env.INDEXNOW_ENDPOINT ?? 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 10_000;

if (!KEY) {
	console.error('INDEXNOW_KEY is not set. Create one with `openssl rand -hex 16`.');
	process.exit(1);
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function readSitemap(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}

	return response.text();
}

async function main() {
	const xml = await readSitemap(`${SITE_URL}/sitemap.xml`);
	const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

	console.log(`Found ${locations.length} URLs in the sitemap.`);

	/** @type {{url: string}[][]} */
	const batches = [];

	for (let index = 0; index < locations.length; index += BATCH_SIZE) {
		batches.push(locations.slice(index, index + BATCH_SIZE).map((url) => ({ url })));
	}

	let submitted = 0;

	for (const [index, batch] of batches.entries()) {
		const response = await fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify({
				host: new URL(SITE_URL).host,
				key: KEY,
				keyLocation: `${SITE_URL}/${KEY}.txt`,
				urlList: batch
			})
		});

		if (!response.ok) {
			throw new Error(`Batch ${index + 1} rejected: ${response.status} ${await response.text()}`);
		}

		submitted += batch.length;
		console.log(`Batch ${index + 1}/${batches.length}: ${batch.length} URLs accepted.`);
	}

	console.log(`Done. ${submitted} URLs submitted to IndexNow.`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
