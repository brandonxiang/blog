# AGENTS.md - Developer Guide for BrandonXIANG Blog

## Project Overview

This is a SvelteKit-based blog application. The project uses Svelte 5 with runes, TypeScript, and follows a markdown-based content workflow.

## Build Commands

### Development

```bash
npm run dev          # Start Vite dev server with hot reload
```

### Building

```bash
npm run build        # Build for production (prerendered)
npm run preview      # Preview production build locally
```

### Type Checking & Linting

```bash
npm run check              # Run svelte-check (TypeScript + Svelte type checking)
npm run check:watch        # Watch mode for type checking
npm run lint               # Run prettier --check AND eslint
npm run format             # Format code with prettier (writes changes)
```

### Running a Single Test

This project does not have a dedicated test framework configured. To test functionality manually:

1. Use `npm run dev` to start the development server
2. Navigate to `http://localhost:5173` to verify changes

## Code Style Guidelines

### General Conventions

- **Indentation**: Use tabs (Prettier config: `useTabs: true`)
- **Quotes**: Single quotes (`singleQuote: true`)
- **Trailing Commas**: None (`trailingComma: "none"`)
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

- Use SvelteKit `$lib` alias for internal imports: `import { getPosts } from '$lib/getPosts'`
- Use `$env` for environment variables
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
```

## Editor Setup

### Recommended Extensions

- Svelte for VS Code
- ESLint
- Prettier

### Pre-commit Hooks

The project uses ESLint and Prettier for linting. Run `npm run lint` before committing.

## Environment Variables

Not currently required. The blog uses static markdown files for content.

## Additional Notes

- The blog supports both markdown files (in `posts/` directory) and external Notion links
- RSS feed available at `/rss.xml`
- Sitemap available at `/sitemap.xml`
- PWA support is configured via `@vite-pwa/sveltekit`
