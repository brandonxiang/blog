# AGENTS.md - Developer Guide for BrandonXIANG Blog

## Project Overview

This is a SvelteKit-based blog application. The project uses Svelte 5 with runes, TypeScript, and follows a markdown-based content workflow.

## Build Commands

### Development

```bash
pnpm dev            # Start the dev server with hot reload (via `vp`)
```

### Building

```bash
pnpm build          # Build for production (prerendered)
pnpm preview        # Preview production build locally
```

### Type Checking & Linting

```bash
pnpm check              # Run svelte-check (TypeScript + Svelte type checking)
pnpm check:watch        # Watch mode for type checking
pnpm test               # Run unit tests with Vitest
pnpm test:watch         # Watch mode for unit tests
pnpm lint               # Run `vp fmt --check` AND `vp lint` (oxlint)
pnpm format             # Format code with oxfmt (writes changes)
```

### Running a Single Test

Use Vitest's file filtering to run a single test file:

```bash
pnpm test -- __tests__/markdown.test.js
```

## Testing

- **All unit tests live in the root `__tests__/` directory.** Do not co-locate `*.test.js` files next to the modules they cover — `src/` contains application code only.
- Name files after the unit under test, not after the file type: `__tests__/seo.test.js` for `src/lib/seo.js`, `__tests__/blog-list.test.js` for `src/routes/blog/+page.server.js`.
- Import the module under test with a relative path from `__tests__/`, e.g. `import { createSeo } from '../src/lib/seo.js'`.
- Use `#lib/...` specifiers for `vi.mock(...)` so the mock matches how the module under test imports it.
- Keep route/endpoint modules server-only: import `load` / `GET` directly from the route file and pass a stub event when the signature requires one.
- Use the `vite-plus/test` entrypoint for `describe` / `it` / `expect` / `vi`, matching the existing files.
- Temporary files go under `os.tmpdir()` and must be removed in an `afterEach` hook.
- Type-check tests along with the app: `__tests__` is listed in the `include` array of `tsconfig.json`, so JSDoc annotations are required there too.

## Images

Blog posts embed screenshots and GIFs straight out of `static/img/`. `src/lib/markdown.js` post-processes every rendered image at build time:

- absolute `https://brandonxiang.top/...` URLs are rewritten to root-relative paths, so posts also work on localhost and preview deployments (this also makes the prerenderer fail the build on a broken reference)
- intrinsic `width`/`height` are read from the file header and emitted so the browser reserves space and CLS stays at 0
- images are lazy loaded, which matters because several posts embed multi-megabyte GIFs far below the fold
- if WebP variants exist next to the original, the image is wrapped in a `<picture>` with a responsive `srcset`

### Adding an image

1. Drop the original into `static/img/`.
2. Reference it from the post with a root-relative path, or with the canonical absolute URL if you prefer — both are normalised.
3. Run `pnpm images:optimize` to generate the `640`/`880`/`1280`/`1760` WebP variants.
4. Commit the generated `.webp` files. They are build artefacts that are served statically, so a normal `pnpm build` never needs `sharp`; it is a devDependency used only by `scripts/optimize-images.mjs`.

Animated GIFs are intentionally skipped by the optimiser — re-encoding them would lose animation.

## Performance Baseline

Measured with `agent-browser` against `pnpm preview` under 4x CPU throttling and Slow 4G (1.6 Mbit/s, 150 ms RTT):

| Route          | LCP        | CLS | Transferred |
| -------------- | ---------- | --- | ----------- |
| `/`            | ~470 ms    | 0   | ~47 KB      |
| `/blog`        | ~650 ms    | 0   | ~71 KB      |
| `/blog/<slug>` | ~0.7–1.5 s | 0   | 70–210 KB   |

If a change pushes LCP past ~2.5 s or CLS above 0.1 on a post page, it needs investigating before it lands.

## Code Style Guidelines

### General Conventions

Formatting is handled by `oxfmt` and linting by `oxlint`, both configured in `vite.config.js` (the `fmt` key) and `.oxlintrc.json`. Do not add a Prettier or ESLint config.

- **Indentation**: Use tabs (`useTabs: true`)
- **Quotes**: Single quotes (`singleQuote: true`)
- **Trailing Commas**: None (`trailingComma: 'none'`)
- **Print Width**: 100 characters (`printWidth: 100`)

### TypeScript

- **Strict Mode**: Enabled in `tsconfig.json`
- Use JSDoc annotations for type hints in JavaScript files
- Prefer TypeScript types over `@ts-ignore` or `@ts-nocheck`
- Use `// @ts-nocheck` only when absolutely necessary (see `src/interface/post.js`)
- Example JSDoc typing:

```javascript
/** @type {{date: string; title: string; description?: string}} */
let metadata = { date: '', title: '' };
```

### Svelte 5 Patterns

- Use Svelte 5 runes: `$props()`, `$derived()`, `$state()`
- Example component props pattern:

```svelte
<script>
	/** @type {{segment: string}} */
	let { segment } = $props();

	let isActive = $derived(segment.includes('/blog'));
</script>
```

- Use `+page.server.js` for server-side load functions with `prerender = true` for static pages
- Define types using `@typedef` in `<script>` blocks

### Naming Conventions

- **Files**: camelCase for JavaScript/TypeScript files, PascalCase for Svelte components
- **Components**: PascalCase (e.g., `Nav.svelte`)
- **Variables/Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE when appropriate

### Import Patterns

- Use the `#lib` subpath import for internal imports: `import { getPosts } from '#lib/getPosts.js'`. Module extensions are required since SvelteKit 3. The alias is declared in the `imports` field of `package.json`.
- Use `$app/env/private` and `$app/env/public` for environment variables (the `$env/*` modules are deprecated as of SvelteKit 3)
- Group imports: external first, then internal

### Error Handling

- Use try/catch in `+page.server.js` load functions
- Return meaningful error objects to the client
- Use SvelteKit's error handling utilities for server errors

### CSS/Styling

- Scoped styles in `<style>` blocks within Svelte components
- Use CSS custom properties for theming when possible
- Follow mobile-first responsive design patterns

## Project Structure

```
src/
├── lib/                  # Shared library code
│   ├── getPosts.js       # Post retrieval utilities
│   ├── markdown.js       # Markdown processing
│   ├── Nav.svelte        # Navigation component
│   └── variables.js      # Shared constants
├── routes/               # SvelteKit routes
│   ├── +page.svelte      # Home page
│   ├── +page.server.js   # Home page server load
│   ├── blog/
│   │   ├── +page.svelte # Blog listing
│   │   └── [slug]/      # Individual blog post
│   └── rss.xml/          # RSS feed endpoint
├── interface/           # TypeScript type definitions
│   └── post.js           # Post type definitions
└── app.html              # HTML shell
posts/                    # Markdown blog posts (in repo root)
__tests__/                # All unit tests (Vitest)
```

## Editor Setup

### Recommended Extensions

- Svelte for VS Code
- oxlint (via the Vite+ extension, if available)

### Pre-commit Hooks

The project uses oxfmt and oxlint. Run `pnpm lint` before committing.

## Environment Variables

Not currently required for the content pipeline. `VITE_CLIENT_ID` / `VITE_CLIENT_SECRET` (see `src/lib/variables.js`) and the `VITE_VERCEL_OBSERVABILITY_*` variables read by `src/routes/+layout.svelte` are injected by Vercel at build time.

## Additional Notes

- The blog supports both markdown files (in `posts/` directory) and external Notion links
- RSS feed available at `/rss.xml`
- Sitemap available at `/sitemap.xml`
- SvelteKit configuration (adapter, `paths`) lives in the `sveltekit()` plugin options in `vite.config.js`. There is no `svelte.config.js` — SvelteKit 3 removed it.
- The web app manifest is a plain static file at `static/manifest.json`, linked from `src/app.html`. There is no service worker.
