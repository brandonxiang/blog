# little-learner Privacy Page Design

## Context

The project is a SvelteKit blog using static prerendered routes. Google Play requires a
public, active, non-PDF privacy policy URL for Android apps. The new `/privacy` page will
serve as the privacy policy URL for the Android app `little-learner`.

`little-learner` is an infant and toddler flashcard learning app published by the individual
developer Brandon Xiang.

## Goals

- Add a public privacy policy page at `/privacy`.
- Make the page suitable for Google Play review.
- Explain the app's data practices in both English and Chinese.
- Keep the page static, simple, and consistent with the existing blog style.

## Non-Goals

- Do not add a privacy policy link to the main navigation.
- Do not create account deletion flows because the app has no accounts.
- Do not add backend routes, forms, analytics, or data collection.
- Do not change unrelated pages or site-wide styling.

## Privacy Content

The page will be clearly labeled as `Privacy Policy / 隐私政策`.

It will include:

- App name: `little-learner`.
- Developer: individual developer Brandon Xiang.
- Privacy contact: `brandon.xiang@gmail.com`.
- App purpose: infant and toddler flashcard learning.
- Effective date: `2026-05-08`.
- Data collection statement: the app does not collect, upload, sell, or share personal data.
- Account statement: the app does not provide user accounts.
- Ads and analytics statement: the app does not use advertising, analytics, or crash reporting
  SDKs.
- Network permission statement: network access is used to load remote flashcard content,
  images, and audio.
- Storage permission statement: storage is used only to cache or save the app's own
  flashcard resources locally on the device.
- Audio statement: sound playback is used for learning content and does not record audio.
- Children's privacy statement: the app does not knowingly collect children's personal
  information.
- Retention and deletion statement: there is no server-side personal data to retain or delete;
  local cached app resources can be removed by clearing app data or uninstalling the app.
- Security statement: because no personal data is collected, personal data is not transmitted
  by the app; remote content should be loaded over normal network connections.
- Policy update statement: future changes will be reflected on the page.

## Page Structure

`src/routes/privacy/+page.svelte` will contain static bilingual content:

1. Header with page title, app name, developer, contact email, and effective date.
2. English section with concise policy text.
3. Chinese section with equivalent policy text.
4. Contact section repeated or shared at the end.

The page will use existing global typography and a small amount of scoped CSS for:

- readable policy width;
- section spacing;
- subtle metadata styling;
- mobile-friendly layout.

## SvelteKit Integration

Add:

- `src/routes/privacy/+page.svelte`
- `src/routes/privacy/+page.server.js`

`+page.server.js` will export `prerender = true`, following the existing static page pattern.

The page will set:

- `<title>Privacy Policy - little-learner</title>`
- a description meta tag summarizing that this is the privacy policy for `little-learner`.

No shared component extraction is needed because this is a single static policy page.

## Data Flow

There is no runtime data flow for the page. It renders static content at build time.

## Error Handling

No custom error handling is required. If the route exists and builds successfully, SvelteKit
will serve the prerendered page.

## Verification

Run:

- `npm run check`
- `npm run build`

Optional manual check:

- Start `npm run dev`.
- Visit `http://localhost:5173/privacy`.
- Confirm the page renders, is readable on mobile width, and contains the app name,
  developer name, contact email, and bilingual privacy sections.

## Open Risks

- If the Android app later adds accounts, analytics, ads, crash reporting, uploads, custom
  user content, or third-party SDKs that collect data, the policy and Google Play Data safety
  form must be updated before release.
- If the app's Google Play listing uses a developer name different from `Brandon Xiang`, the
  privacy policy should be updated to match the listing.
