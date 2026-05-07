# little-learner Privacy Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static `/privacy` route for the Android app `little-learner` that can be used
as the Google Play privacy policy URL.

**Architecture:** Add a self-contained SvelteKit route with static bilingual policy content and
route-level prerendering. The route follows existing static page patterns and does not introduce
shared components, runtime data loading, backend APIs, analytics, or navigation changes.

**Tech Stack:** SvelteKit, Svelte 5, JavaScript with JSDoc style, scoped Svelte CSS, npm scripts
for `svelte-check` and production build verification.

---

## Source Spec

- `docs/superpowers/specs/2026-05-08-little-learner-privacy-design.md`

## File Structure

- Create `src/routes/privacy/+page.server.js`
  - Responsibility: declare the privacy route as statically prerendered.
- Create `src/routes/privacy/+page.svelte`
  - Responsibility: render the complete bilingual privacy policy, page metadata, and small scoped
    styles.
- Do not modify `src/lib/Nav.svelte`
  - The privacy URL is intended for Google Play review and direct linking, not primary blog
    navigation.

## Task 1: Create the Static Privacy Route

**Files:**

- Create: `src/routes/privacy/+page.server.js`
- Create: `src/routes/privacy/+page.svelte`

- [ ] **Step 1: Create the route server file**

Create `src/routes/privacy/+page.server.js`:

```js
export const prerender = true;
```

- [ ] **Step 2: Create the privacy page component**

Create `src/routes/privacy/+page.svelte` with:

```svelte
<svelte:head>
	<title>Privacy Policy - little-learner</title>
	<meta
		name="description"
		content="Privacy Policy for little-learner, an infant and toddler flashcard learning app by Brandon Xiang."
	/>
</svelte:head>

<article class="privacy-page">
	<header class="policy-header">
		<p class="eyebrow">little-learner</p>
		<h1>Privacy Policy / 隐私政策</h1>
		<p class="summary">
			This privacy policy explains how little-learner handles data for Google Play users.
		</p>
		<dl class="meta-list">
			<div>
				<dt>Developer</dt>
				<dd>Brandon Xiang</dd>
			</div>
			<div>
				<dt>Contact</dt>
				<dd><a href="mailto:brandon.xiang@gmail.com">brandon.xiang@gmail.com</a></dd>
			</div>
			<div>
				<dt>Effective date</dt>
				<dd>2026-05-08</dd>
			</div>
		</dl>
	</header>

	<section aria-labelledby="english-policy">
		<h2 id="english-policy">English</h2>

		<h3>1. App purpose</h3>
		<p>
			little-learner is an infant and toddler flashcard learning app provided by the
			individual developer Brandon Xiang.
		</p>

		<h3>2. Data collection</h3>
		<p>
			little-learner does not collect, upload, sell, or share personal data. The app does
			not provide user accounts and does not use advertising, analytics, or crash reporting
			SDKs.
		</p>

		<h3>3. Permissions and local resources</h3>
		<p>
			The app may use network access to load remote flashcard content, images, and audio.
			Storage access is used only to cache or save the app's own flashcard resources locally
			on the device. The app does not read the user's photos, files, contacts, location,
			camera, or microphone. Audio playback is used for learning content and does not record
			audio.
		</p>

		<h3>4. Children's privacy</h3>
		<p>
			little-learner is designed for learning with young children and does not knowingly
			collect children's personal information. If you believe any personal information has
			been provided to us, please contact us so we can review and address the issue.
		</p>

		<h3>5. Data retention and deletion</h3>
		<p>
			Because little-learner does not collect personal data or create user accounts, there is
			no server-side personal data to retain or delete. Local cached app resources can be
			removed by clearing the app's data in Android system settings or by uninstalling the
			app.
		</p>

		<h3>6. Data handling and security</h3>
		<p>
			Because little-learner does not collect personal data, the app does not transmit
			personal data to our servers. Remote learning resources should be loaded through normal
			network connections.
		</p>

		<h3>7. Updates</h3>
		<p>
			If the app's data practices change, this policy will be updated on this page before
			the change is released where required.
		</p>
	</section>

	<section aria-labelledby="chinese-policy">
		<h2 id="chinese-policy">中文</h2>

		<h3>1. 应用用途</h3>
		<p>
			little-learner 是由个人开发者 Brandon Xiang 提供的婴幼儿闪卡教学应用。
		</p>

		<h3>2. 数据收集</h3>
		<p>
			little-learner 不收集、上传、出售或分享个人数据。应用不提供用户账号，也不使用广告、
			统计分析或崩溃上报 SDK。
		</p>

		<h3>3. 权限与本地资源</h3>
		<p>
			应用可能使用网络访问权限加载远程闪卡内容、图片和声音。存储权限仅用于在设备本地
			缓存或保存应用自身的闪卡资源。应用不会读取用户照片、文件、联系人、位置、相机或麦克风。
			声音播放仅用于教学内容，不会录音。
		</p>

		<h3>4. 儿童隐私</h3>
		<p>
			little-learner 面向儿童学习场景设计，不会主动收集儿童个人信息。如果你认为有任何
			个人信息被提供给我们，请通过下方邮箱联系，我们会进行核查并处理。
		</p>

		<h3>5. 数据保留与删除</h3>
		<p>
			由于 little-learner 不收集个人数据，也不创建用户账号，因此没有需要保留或删除的服务端
			个人数据。本地缓存的应用资源可以通过 Android 系统设置清除应用数据，或卸载应用来删除。
		</p>

		<h3>6. 数据处理与安全</h3>
		<p>
			由于 little-learner 不收集个人数据，应用不会向我们的服务器传输个人数据。远程学习资源
			会通过正常网络连接加载。
		</p>

		<h3>7. 政策更新</h3>
		<p>
			如果应用的数据处理方式发生变化，我们会在必要时先更新本页面的隐私政策。
		</p>
	</section>

	<footer class="contact">
		<h2>Contact / 联系方式</h2>
		<p>
			For privacy questions, contact
			<a href="mailto:brandon.xiang@gmail.com">brandon.xiang@gmail.com</a>.
		</p>
	</footer>
</article>

<style>
	.privacy-page {
		max-width: 44em;
		margin: 0 auto;
	}

	.policy-header {
		margin: 2em 0 3em;
	}

	.eyebrow,
	.summary,
	.meta-list,
	.contact p {
		color: #666;
	}

	.eyebrow {
		font-family: Rubik, sans-serif;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}

	.summary {
		font-size: 1.2rem;
		margin-top: -0.5rem;
	}

	.meta-list {
		border-left: 3px solid #fd6378;
		margin: 2em 0 0;
		padding-left: 1rem;
	}

	.meta-list div {
		margin: 0.75rem 0;
	}

	.meta-list dt {
		font-family: Rubik, sans-serif;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.meta-list dd {
		margin: 0.15rem 0 0;
	}

	section {
		margin: 3em 0;
	}

	h2 {
		border-bottom: 1px solid #eee;
		padding-bottom: 0.35em;
	}

	h3 {
		margin-top: 1.5em;
	}

	.contact {
		border-top: 1px solid #eee;
		margin-top: 3em;
		padding-top: 2em;
	}

	@media (max-width: 480px) {
		.policy-header {
			margin-top: 1em;
		}

		.summary {
			font-size: 1rem;
		}
	}
</style>
```

- [ ] **Step 3: Review content against the spec**

Check that the page includes:

- `little-learner`
- `Brandon Xiang`
- `brandon.xiang@gmail.com`
- `2026-05-08`
- no data collection, upload, selling, or sharing
- no accounts, ads, analytics, or crash reporting SDKs
- network permission for remote flashcard content, images, and audio
- storage permission for local app resource cache only
- no reading user photos, files, contacts, location, camera, or microphone
- children's privacy
- local cache deletion instructions
- data handling and security statement

- [ ] **Step 4: Commit route files**

Run:

```bash
git add src/routes/privacy/+page.server.js src/routes/privacy/+page.svelte
git commit -m "feat: add little learner privacy page"
```

Expected: commit succeeds with only the two privacy route files included.

## Task 2: Verify the Route

**Files:**

- Check: `src/routes/privacy/+page.server.js`
- Check: `src/routes/privacy/+page.svelte`

- [ ] **Step 1: Run Svelte type checking**

Run:

```bash
npm run check
```

Expected: command exits successfully. Existing unrelated warnings, if any, should be recorded
and not hidden.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: command exits successfully and includes the prerendered `/privacy` route in the build.

- [ ] **Step 3: Optional manual browser check**

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/privacy
```

Expected:

- page renders without console/build errors;
- title reads `Privacy Policy / 隐私政策`;
- content is readable on desktop and mobile widths;
- app name, developer name, contact email, and effective date are visible.

- [ ] **Step 4: Commit any verification-only fixes**

If verification reveals small page or style issues, fix only those issues and commit:

```bash
git add src/routes/privacy/+page.server.js src/routes/privacy/+page.svelte
git commit -m "fix: polish little learner privacy page"
```

Expected: no commit is created if no fixes are needed.
