# Hand Off

## Latest Update - 2026-06-21 Mobile Hero / Touch Polish

- Recent focus: mobile homepage hero, mobile video source, bottom HUD overlap, city/location mobile readability, and About `close` touch target.
- GitHub note:
  - Earlier work was committed and pushed to `origin/main` as commit `62d9507`.
  - The mobile hero/video changes below are after that push and are not committed yet unless a later agent does it.
- Current active working tree after this update:
  - `hand off.md`
  - `src/app/globals.css`
  - `src/components/photography-portfolio.tsx`
  - `public/portfolio/videos/web-6-phone2.mp4` (new, copied from `Photos\web 6 phone2.mp4`; original source asset remains untouched)
- Mobile hero video:
  - `src/components/photography-portfolio.tsx` now renders two hero videos:
    - desktop: `/portfolio/videos/web7.mp4` with class `.photo-hero-video--desktop`
    - mobile: `/portfolio/videos/web-6-phone2.mp4` with class `.photo-hero-video--mobile`
  - `src/app/globals.css` hides mobile video by default, then at `@media (max-width: 900px)` hides desktop video and shows the mobile one.
  - Verification in the in-app browser at `430x932` confirmed the visible video source is `http://localhost:3000/portfolio/videos/web-6-phone2.mp4`.
  - Keep this split; do not replace the desktop hero video when only mobile is requested.
- Mobile `BIN` hero title:
  - User wants the PC-like feeling where the giant `BIN` touches the top and edges, but without visibly cutting off B/N.
  - Current mobile rules in `src/app/globals.css`:
    - `.photo-hero-title`: `left: 0`, `top: -1.8vw`, `width: 100%`, `font-size: clamp(148px, 45.5vw, 196px)`, `line-height: 0.72`, `padding-inline: 0`.
    - first letter transform: `translateX(0.1em)`.
    - middle letter transform: `translateX(0)`.
    - last letter transform: `translateX(-0.1em)`.
  - The apparent reversal is intentional: with transform `0`, the glyphs themselves protrude about 20px (`B -20`, `N 450`) in a 430px viewport. Moving B inward by `0.1em` and N inward by `-0.1em` makes the glyph boxes complete while still edge-hugging.
  - Latest measured result at `430x932`:
    - `B` left `0`, right `152`
    - `I` left `172`, right `248`
    - `N` left `267`, right `430`
    - document horizontal overflow `0`
  - The user previously said the `B -20 / N 450` direction felt visually correct, but the newest instruction was to "收一点" so the glyphs are complete in-screen while keeping the edge-hugging feeling. Current state matches that.
- Mobile bottom hero HUD:
  - Mobile `.photo-hero-caption strong` is hidden to remove `PHOTO PORTFOLIO` overlap on phone.
  - PC still keeps the full bottom caption.
  - The round `N` button seen in screenshots is the Codex/in-app browser overlay, not a website DOM button.
- About `close` tap target:
  - `close` remains visually small text.
  - Hit area is now at least `48px x 48px`.
  - Position is bottom-right and safe-area aware with `env(safe-area-inset-right/bottom)`.
  - This follows the agreed mobile logic: small visual label, large touch target, bottom-right placement.
- Mobile city/location section:
  - Mobile `.photo-tube-text` was reduced so the city word is more readable on phone:
    - `height: clamp(82px, 23vw, 112px)`
    - `font-size: clamp(50px, 13.8vw, 60px)`
  - This was a targeted mobile readability fix and should not affect desktop.
- Verification after the latest mobile changes:
  - `npm.cmd run typecheck` passed.
  - In-app browser measurement passed at `430x932` for mobile `BIN` bounds and no horizontal overflow.
- If continuing:
  - If the user says B/N should feel even closer to the screen edge, tune only the first/last letter `translateX(...)` values in the mobile media query, in very small steps like `0.02em`.
  - Do not change the desktop `.photo-hero-title` or desktop video for mobile-only requests.
  - If the user wants a different phone video, copy the file into `public/portfolio/videos/` with an ASCII filename and update only the mobile video `src`.
  - Before committing/pushing, remember the new mp4 is large (about 60 MB); confirm GitHub accepts it or use Git LFS if the repository requires it.

## Latest Update - 2026-06-21 Later

- Recent focus: page transitions between homepage and `/more`, direct return positioning to the final white homepage section, and About page close-link placement.
- `/more` entry transition:
  - Triggered by the bottom `more` link in `src/components/photography-portfolio.tsx`.
  - Uses a temporary DOM overlay appended to `document.body` with `.more-page-transition` panels.
  - Sequence: black left/right panels close toward center, route pushes to `/more`, then white panels close and fade away.
  - `/more` opening animation is delayed with `bin-more-entry-transition` in `src/components/more-photo-field.tsx` so the photo stack does not start hidden behind the transition.
- `/more` exit transition:
  - Implemented in `src/components/history-back-link.tsx` with `transitionVariant="more-exit"`.
  - Used by `/more` footer `BIN` and `close` links in `src/app/more/page.tsx`.
  - Current desired sequence: black panels close first, then white panels close, then navigate home.
  - After discussion, the return should not visibly scroll or animate the homepage upward. It should directly land on the final white homepage section.
  - For `/more` exit, use `router.push("/", { scroll: false })` rather than `router.back()`. `router.back()` can restore an old browser-history scroll position and cause the wrong landing behavior.
  - The exit writes `bin-return-home-final-once`; homepage consumes it to skip intro and jump directly to the final white section.
- Homepage direct-final return behavior:
  - Implemented in `src/components/photography-portfolio.tsx`.
  - On `bin-return-home-final-once`, the homepage skips intro, scrolls to document bottom over a few frames while still covered by the transition overlay, and sets the final white sheet/words directly to their final state.
  - Do not reintroduce a visible "slide up to final page" effect for this return path; the user explicitly rejected that logic and asked whether returning directly to the final page is possible.
- About page close placement:
  - `src/app/about/page.tsx`: `close` was moved out of `.about-page__header` so it is no longer affected by the header transform animation.
  - `src/app/globals.css`: `.about-page__close` is now fixed at the bottom-right, using a position and scale close to `/more`'s close link.
  - Important: keeping `close` inside the animated header makes `position: fixed` behave relative to the transformed header, causing it to stay near the top. Keep it as an independent child of `.about-page`.
- Verification after this work:
  - `npm.cmd run typecheck` passed.
  - `npm.cmd run lint` passed with the same existing 3 warnings in `src/components/photography-portfolio.tsx`.
  - Playwright QA passed for `/more` returning directly to the final homepage white section:
    - final sheet was in viewport (`top: -1`, `bottom: 899` in a 1440x900 test).
    - transition overlay was removed.
    - no console/page errors.
  - Playwright screenshot verification for About close after moving it out of the header could not be rerun because the tool approval was rejected due usage limits. The structure was fixed after an earlier failed QA showed `close` was still top-positioned because of the transformed header.
- If continuing:
  - For `/more` entry/exit timing, tune only durations/eases in `openMorePage` and `HistoryBackLink` before changing structure.
  - For return-to-home behavior, preserve direct final-page landing; do not switch back to browser history restoration or visible scroll-to-bottom animation.
  - For About close placement, inspect `/about` manually or with Playwright once available; expected position is bottom-right like `/more` close.

## Latest Update - 2026-06-21

- Recent focus: homepage location/tube text section in `src/components/tube-text-scroll.tsx` and related styles in `src/app/globals.css`.
- User-reported issue: during the `SHOT IN` city word transition, the dark red halo around words such as `WENZHOU` / `BEIHAI` changes abruptly. The problem is specifically the outside red glow/halo shape and radius, not the city word text color itself.
- Important interpretation:
  - The visual jump is between the animated/melting glow state and the settled/clear glow state.
  - In the original implementation, animated glow used a much larger blur/scale (`meltGlowFilter`, outgoing glow `scale`) than the settled glow (`clearGlowFilter`, `scale: 1`), so the outer red halo can appear to snap from wide to tight.
  - Do not solve this by making the main text pure red; the user wants the original black text with dark red glow feeling.
  - Do not solve this by adding a separate fixed aura layer unless explicitly requested again; that attempt was rejected and reverted because it did not match the user's visual read.
- Current minimal attempted fix:
  - Kept the original structure and dark red theme.
  - Reduced the gap between animated glow and settled glow:
    - `meltGlowFilter` changed from roughly `blur(48px) contrast(1.9) saturate(1.5)` to a smaller animated glow (`blur(30px) contrast(1.55) saturate(1.42)`).
    - outgoing glow `scale` reduced from `1.42` to `1.2`.
    - final settle tween duration increased from `0.24s` to `0.48s` with `power2.out`.
  - This is intended to keep the dark red feeling while reducing the sudden halo contraction.
- Verified after the latest change:
  - `npm.cmd run typecheck` passed.
- If continuing this issue:
  - First visually inspect the transition frame-by-frame in the browser.
  - Tune only `meltGlowFilter`, outgoing glow `scale`, and the final settle tween duration/ease before changing structure.
  - Avoid broad rewrites of `TubeTextScroll`; the user has already had several unsuccessful iterations and wants precise visual tuning.

## Latest State - 2026-06-20

This document is the current project handoff for `F:\Desktop\web-black`. It records the practical project knowledge, current visual direction, known pitfalls, preview status, and the latest `/more` animation work.

## Latest Practical Update - 2026-06-20

- The local preview is intended to run on `http://localhost:3000/`.
- A stuck Next dev process was found on port `3000`: it was listening but requests to `http://localhost:3000/` timed out.
- The stuck process was stopped and `npm.cmd run dev` was started again.
- After restart, `http://localhost:3000/` returned `STATUS=200`.
- If the in-app browser still shows an old error page, first re-enter `http://localhost:3000/` in the address bar or open a fresh tab. Do not immediately assume app code is broken.
- Current `/more` work before this handoff:
  - Bottom chrome no longer has the gray horizontal strip.
  - Right footer nav now only shows a larger `close` link; `list` was removed.
  - Clicking a visible photo opens a plain enlarged preview with no extra UI or overlay styling.
  - During the enlarge animation, the rest of the track continues moving; after enlarge completes, track motion pauses.
  - Clicking outside the enlarged photo closes it; the track resumes immediately and the preview animates back to the photo's current moving track position.
  - Original clicked card is hidden while the clone preview enlarges, so duplicate source/preview overlap is avoided.
  - Offscreen/hidden track cards now keep their `x/y` updated every tick to avoid one-frame flashes when entering the viewport.
  - Reverse wheel movement has a lower progress limit so users cannot keep scrolling into deep blank white space; after wheel stops, the normal forward drift resumes.
  - Smoke photo ID `24` (`/portfolio/more/more-24.webp`) was made smaller with a special size override.
  - Multi-size Playwright QA passed for `1728x992`, `1440x900`, `1024x768`, and `390x844`: `/more` returned `200`, no console/page errors, gray strip was absent, and click-open/click-outside-close preview worked.

## Project Overview

- Project: BIN personal photography portfolio site.
- Workspace: `F:\Desktop\web-black`.
- Framework: Next.js 16.2.1 with React 19.2.4.
- Styling: Tailwind CSS 4 plus project CSS in `src/app/globals.css`.
- Animation: GSAP 3.13.0. Homepage gallery uses GSAP + ScrollTrigger. `/more` uses GSAP ticker/timeline directly.
- Main page route: `src/app/page.tsx`.
- Main portfolio component: `src/components/photography-portfolio.tsx`.
- Global styles: `src/app/globals.css`.
- About route: `src/app/about/page.tsx`.
- More route: `src/app/more/page.tsx`.
- Main photo manifest: `src/data/portfolio-photos.json`.
- More photo manifest: `src/data/more-photos.json`.
- Used homepage photo assets: `public/portfolio/photos/`.
- Used `/more` photo assets: `public/portfolio/more/`.
- Original source photos: `Photos/` must stay ignored and unuploaded unless the user explicitly asks.
- Extra `/more` source photos: `Photos/photoext/`.

## Agent / Collaboration Rules

- Default language with the user: Chinese.
- Before modifying files, running commands, or accessing accounts, explain the purpose and risk in plain language.
- Do not batch-delete files or folders.
- Never delete source code, `Photos/`, `public/portfolio/photos/`, `public/portfolio/social/`, `public/portfolio/more/`, `src/`, `skills/`, `design-md-library/`, `node_modules/`, `.git/`, or user-provided assets unless the user explicitly names that exact target.
- If cleanup is needed, only clean clearly disposable local artifacts after stating exact paths and risk. Allowed cleanup targets include `.next/`, `temp/`, local `*.log`, root Playwright screenshot PNGs, and generated dev-server logs.
- The working tree may contain user or prior-agent edits. Do not revert unrelated changes.
- For animation work, read relevant GSAP skills first when required by the current environment.
- For Next.js 16 framework-level edits, read the relevant guide under `node_modules/next/dist/docs/` first.

## Preview / Server Rules

- Normal dev command: `npm run dev`.
- Normal dev URL: `http://localhost:3000/`.
- LAN URL: `http://192.168.31.180:3000/`.
- Port `3000` is the correct routine preview port.
- Do not use `Start-Job`, `start /b`, `Start-Process`, hidden windows, or any background launch method for this project preview unless the user explicitly asks.
- Keep the shell running `npm run dev` open in the foreground.
- If the dev process exits and the user asked for it to remain available, restart with the same foreground `npm run dev`.
- Before starting or restarting preview, check port `3000`:
  - `netstat -ano | Select-String ':3000'`
- If port `3000` is listening but browser requests hang, treat it as a stuck Next process or stale browser state, not automatically as broken site code.
- Avoid repeated restarts; the user was frustrated because earlier agents spent too long on server handling.
- Do not switch routine preview work to `3100`. `dev:local` still exists in `package.json`, but current project guidance is to use port `3000`.
- `next.config.ts` currently includes:
  - `allowedDevOrigins: ["192.168.31.180"]`
  - `output: "standalone"`
- The LAN `allowedDevOrigins` entry is important; without it, Next dev resources such as HMR can be blocked from `192.168.31.180`.
- Avoid clearing `.next/` during ordinary visual tuning. Clearing `.next/` forces a cold rebuild and should only happen after stating the exact path and risk.

## Commands

- `npm run dev` - foreground development server on port `3000`.
- `npm run build` - production build.
- `npm run lint` - ESLint check.
- `npm run typecheck` - TypeScript check.
- `npm run check` - lint + typecheck + build.
- In this environment, `npm.cmd run ...` is the safest PowerShell form.

## Known Technical Pitfalls

- A previous major blocker was a Next/HTTP `ByteString` error caused by non-ASCII characters in resource paths. Keep public asset URLs ASCII-only.
- `src/data/portfolio-photos.json` should keep `src` values like `/portfolio/photos/01-DSCF0436.jpg`, not Chinese filenames or paths.
- Display text can be Chinese, but URLs and public resource paths should stay ASCII.
- Another previous blocker was cross-origin dev-resource blocking on LAN. Keep `allowedDevOrigins: ["192.168.31.180"]`.
- Windows Playwright/Chromium may fail with `spawn EPERM`; if visual QA is essential, use a one-off escalated command after explaining risk.
- In-app browser can hold stale localhost failures in `CLOSE_WAIT` / `FIN_WAIT_2`. Re-enter the URL or use a fresh tab before assuming the code is wrong.
- `Get-CimInstance` / `tasklist` process inspection can be blocked by Windows permissions.
- `Start-Process` can fail in this workspace because of duplicate `Path` / `PATH` environment keys. Do not infer site code failure from that.

## Current Visual Direction

The site is a BIN-branded personal photography portfolio. It should feel photographic, minimal, cinematic, and premium rather than like a SaaS/marketing page.

Homepage direction:

- Intro: black screen, small premium white `BIN`, hollow/masked reveal, then forward exit.
- Hero: full-screen image with oversized split `B`, `I`, `N`.
- Location section: `src/components/tube-text-scroll.tsx`.
- Work/gallery: dark grayscale motion-blur mood, HUD/REC details, soft blurred `MY WORK`, floating photo cards, red scroll glow, smooth motion.
- Avoid loud UI cards, decorative blobs, marketing copy, or dense explanatory text.

Current broader references:

- Kookie-inspired homepage/gallery direction.
- Brady Perron-inspired `/more` photo field.

## Homepage / Main Portfolio

- Main implementation lives mostly in `src/components/photography-portfolio.tsx`.
- Do not reintroduce whole-page wheel hijacking or broad `preventDefault` scroll inertia on the homepage.
- Prefer local ScrollTrigger scrub, CSS transforms, and scoped velocity effects.
- Gallery red glow is driven by `--scroll-glow` on `.photo-gallery-scene`.
- Caption/bottom strip animation should remain linked to each `.photo-card` timeline.
- The final white page includes minimal camera text:
  - `ALL`
  - `SHOT ON`
  - `FUJIFILM`
  - `XH2`
- Final page `ABOUT` link appears bottom-right after the final words reveal.
- Clicking `ABOUT` routes to `/about`.
- `src/components/bulge-text-effect.tsx` may still exist but is not part of the current final-page direction.

## Intro Alignment Notes

The intro uses one shared SVG coordinate system. Keep these aligned:

- `introWordRef`
- `introOutlineRef`
- `introMaskTextRef`
- `introMaskRef`

Shared text coordinates:

- `x="600"`
- `y="522"`
- `textAnchor="middle"`
- `dominantBaseline="middle"`

GSAP transform center should match:

```ts
translate(600 522) scale(...) translate(-600 -522)
```

If the intro feels wrong, first tune SVG `y`, font size, letter spacing, outline stroke width, GSAP durations/eases/scale, before splitting layers into separate HTML elements.

## About Page

Files:

- Route: `src/app/about/page.tsx`.
- Styles: `src/app/globals.css`.
- Current avatar asset: `public/portfolio/about/binbin-yaya-duck.jpg`.
- Original user-provided image source was `F:\Desktop\binbin yaya .jpg`; do not modify or delete it.

Current layout:

- Minimal white page.
- Header:
  - left: `about - bin`
  - right: `close`, linking back to `/`.
- Left contact/social block:
  - label: `( contact )`
  - social links are placeholders unless the user provides real URLs.
- Right visual block:
  - duck avatar image.
  - large black `BIN` under the avatar.
- Footer and old descriptive role line were removed.
- The large intro sentence was removed.

Responsive notes:

- Avatar and `BIN` should behave as one responsive composition.
- Size is constrained by viewport width and viewport height through CSS variables:
  - `--about-avatar-width`
  - `--about-avatar-top`
  - `--about-brand-size`
  - `--about-brand-margin`
- Additional rules exist for:
  - very wide screens: `@media (min-aspect-ratio: 17 / 9)`
  - short desktop screens: `@media (max-height: 760px) and (min-width: 921px)`
  - mobile/tablet: `@media (max-width: 920px)`
- There are inline CSS-variable fallbacks in `src/app/about/page.tsx`. They were added because dev preview sometimes served stale CSS. Keep them unless the preview pipeline becomes consistently stable.

Typography notes:

- `BIN` uses a heavy black luxury-editorial style:
  - `"Arial Black", "Helvetica Neue", Arial, sans-serif`
  - tight negative tracking
  - horizontal scale
- The user wanted a feeling similar to a bold black/red `ILCAPO` reference, but rendered as black `BIN`.
- Chinese social font direction should be rounder and softer:
  - `"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif`

## More Page

Purpose:

- `/more` is an extra photo preview field opened from the bottom `more` link.
- It is inspired by `https://www.bradyperron.com/`.
- The user specifically wanted:
  - white background.
  - a small central stack of photos at first.
  - photos quickly stack from one center point.
  - then explode/scatter outward.
  - after scatter, the photo field drifts slowly like an infinite preview canvas.
  - mouse wheel should not behave like normal page scroll; it should add acceleration to the photo field.
  - wheel down speeds movement one way.
  - wheel up reverses along the same tracks, with inertia decay.
  - after a pause, movement continues forward along predefined routes.
  - photos should not be a normal grid.
  - photos should be mostly upright, with varied sizes/proportions and light overlap.

Files:

- Route: `src/app/more/page.tsx`.
- Component: `src/components/more-photo-field.tsx`.
- Scoped CSS module: `src/components/more-photo-field.module.css`.
- Manifest: `src/data/more-photos.json`.
- Generation script: `scripts/generate-more-photos.mjs`.
- Public optimized assets: `public/portfolio/more/`.
- Source folder: `Photos/photoext/`.

Current `/more` page structure:

- `src/app/more/page.tsx` renders `<MorePhotoField />`.
- Fixed footer chrome:
  - left brand link `BIN` back to `/`.
  - right nav shows only a slightly larger `close` link back to `/`.
  - the old gray horizontal footer strip is disabled.
- Hidden legacy header remains for accessibility/structure but is styled away.

Current `/more` animation implementation:

- Uses `useEffect`, `gsap.context`, GSAP timeline, and GSAP ticker.
- Does not use React state for per-frame animation.
- Cards are centered with `xPercent: -50`, `yPercent: -50`.
- Initial all-card state:
  - `autoAlpha: 0`
  - `scale: 0.34`
  - `x: 0`
  - `y: 0`
  - `rotation: 0`
- Opening sequence:
  - loader mark `BIN` appears.
  - loader line scales in.
  - the first 12 cards appear from the center as a large, solid, layered stack.
  - loader is hidden early with `autoAlpha: 0` and then `display: none`, so it should not remain faintly visible behind photos.
  - the first 12 cards scatter outward.
  - 10 retiring intro cards scatter offscreen and are hidden.
  - 2 hold cards remain, and their scatter end position is already the track start position.
  - ticker starts continuous drift.
- Current intro stack size: `introStackSize = 12`.
- Current intro hold size: `introHoldSize = 2`.
- Current leading/hold photos are controlled by `introLeadPhotoIds = [3, 8]`.
- Those photos are moved to the front through `orderedMorePhotos`; the manifest and asset files are not rewritten.
- Current chosen hold photos:
  - ID `3`: `/portfolio/more/more-03.webp`, night street light trails.
  - ID `8`: `/portfolio/more/more-08.webp`, portrait by the sea with hat.
- `activeGroupSize = 4`.
- `routeCount = 5`.
- `trackSegment = 1180`.
- `trackSlotSpacing = trackSegment / activeGroupSize`.
- `initialTrackProgress = trackSlotSpacing * (introHoldSize - 0.5)`.
- Photos are not currently grouped into hard visible groups. All photos are laid onto route progress, and off-viewport cards are hidden by viewport culling.
- `isTrackCardNearViewport()` uses measured card dimensions and a margin so cards do not disappear too early at screen edges.
- Hidden/off-viewport cards still receive current `x/y` transforms each render tick, with only `autoAlpha` changing. This avoids visible flashes from stale card positions.
- A prior bug where cards looked extremely small was fixed by setting rendered track cards to `scale: 1`.
- Current image sizes were enlarged after the user said overall screen occupancy should be bigger:
  - hero width: `45vw`, max `980px`.
  - portrait width: about `25vw` to `29.05vw`, max `620px`.
  - landscape width: about `34vw` to `40.6vw`, max `880px`.
  - smoke photo ID `24`: `27vw`, max `560px`.
  - image `sizes`: `(max-width: 760px) 82vw, 48vw`.
- Rotation is currently kept at `0` because the user said photos should be straight, not tilted.
- Current movement routes:
  - route 0: left to right in upper area.
  - route 1: right to left around mid area.
  - route 2: top to bottom with slight horizontal drift.
  - route 3: diagonal from lower-left toward upper-right.
  - route 4/default: diagonal from upper-right toward lower-left.
- Slow base drift:
  - `state.progress += (0.44 + state.velocity) * delta`.
- Wheel acceleration:
  - `event.preventDefault()` is scoped only to `/more` root.
  - `state.velocity += event.deltaY * 0.018`.
  - clamped to `-24` to `32`.
  - decays by `Math.pow(0.91, delta)`.
  - upward/reverse wheel movement is limited by `reverseProgressLimit = trackSlotSpacing * 0.12`; hitting this limit stops extra reverse velocity and resumes forward drift after the short hold.
- Click-to-enlarge preview:
  - implemented in `src/components/more-photo-field.tsx` with a temporary `.more-photo-preview-layer` and cloned `<img>`.
  - the original clicked card is hidden immediately via `hiddenPreviewIndex`.
  - during enlarge, track motion continues; `state.isPreviewOpen` is set only after the enlarge tween completes.
  - while preview is open, ticker track motion pauses and wheel input is ignored.
  - closing starts track motion immediately and animates the preview clone back toward the card's live moving track position.
  - clicking the preview image itself does nothing; clicking outside it closes.
- `prefers-reduced-motion`:
  - loader hidden and set to `display: none`.
  - cards are placed directly on their track positions.
  - cards use `scale: 1` and no continuous ticker motion.

Important `/more` tuning history:

- User first wanted a Brady Perron-like photo field.
- First attempt was too stacked/dense.
- Then scatter was made more route-based.
- Then it became too empty or had no follow-up images.
- Then it became too dense again.
- The user wanted the intro to feel closer to Brady Perron:
  - photos should first appear concentrated in the center.
  - the stack should be larger and clearer, not tiny/faint.
  - the scatter should have weight and smoothness.
  - after scatter, most photos should leave the screen, with only one or two around visual center.
- A later issue was that some entering track photos faded in. The user wanted photos entering the viewport to appear directly, not as transparent fade-ins.
- The most recent issue was:
  - the BIN loader remained faintly visible behind the photo stack.
  - the two remaining photos did an extra "return to track" pull before drift began.
  - the initial two photos should be swapped for other photos.
- Latest fix:
  - loader now hides earlier and gets `display: none`.
  - hold cards now use the track start coordinate as the release endpoint.
  - the extra hold-card tween back to track was removed.
  - opening hold photos now use IDs `3` and `8`.

Likely next `/more` tuning direction:

- Preserve the current broad behavior: center stack -> outward scatter -> 2 hold photos -> direct track drift.
- If the user reports a "jump" after the scatter, inspect `getIntroReleasePosition()` and `initialTrackProgress` first.
- If the user wants different opening photos, change `introLeadPhotoIds`, not file names or manifest order.
- If the user says it is too empty, do not simply show all 50 at once. Tune `trackSegment`, route offsets, viewport culling margin, or track start progress first.
- If photos still feel too small, first adjust `widthVw` and `maxWidth` in `getTrackPhotos()`.
- If photos feel too sparse, adjust `trackSegment` down slightly, or make route positions pass more centrally.
- If photos pop too abruptly at edges, adjust `isTrackCardNearViewport()` margin. Be careful with opacity fades because the user specifically disliked visible fade-in for entering photos.
- Keep transforms and opacity only for performance.

## Asset Pipeline

Main gallery:

- Manifest: `src/data/portfolio-photos.json`.
- Public assets: `public/portfolio/photos/`.
- Keep `src` values ASCII-only.

More gallery:

- Source: `Photos/photoext/`.
- Generated public assets: `public/portfolio/more/`.
- Manifest: `src/data/more-photos.json`.
- Script: `scripts/generate-more-photos.mjs`.
- The user compressed the 50 source images before continuing the `/more` work.
- Do not delete or overwrite original source images unless explicitly instructed.

Video / brand assets:

- Hero video reference: `/portfolio/videos/web7.mp4`.
- Relevant video file: `public/portfolio/videos/web7.mp4`.
- FUJIFILM wordmark assets:
  - `public/portfolio/brand/fujifilm-official-wordmark.png`
  - `public/portfolio/brand/fujifilm-official-wordmark-transparent.png`
- X-H2 product image:
  - `public/portfolio/camera/xh2-front-cmos.webp`
- Reminder: official brand marks may carry trademark/authorization risk. The user previously accepted this direction.

## Current Modified / New Files To Be Aware Of

After the latest GitHub push before this handoff, the current active changes are expected to be:

- `hand off.md`
- `src/app/more/page.tsx`
- `src/components/more-photo-field.module.css`
- `src/components/more-photo-field.tsx`

Older `/more` assets and route files are already tracked in Git:

- `public/portfolio/more/`
- `scripts/generate-more-photos.mjs`
- `src/app/more/page.tsx`
- `src/components/more-photo-field.module.css`
- `src/components/more-photo-field.tsx`
- `src/data/more-photos.json`

Treat the working tree as potentially dirty. Do not revert unrelated changes.

## Verification History

Recent checks during latest `/more` work:

- `npm.cmd run typecheck` passed after the preview interaction and footer updates.
- `npm.cmd run lint` passed with the same 3 existing warnings in `src/components/photography-portfolio.tsx`.
- Escalated Playwright visual QA passed for:
  - `1728 x 992`
  - `1440 x 900`
  - `1024 x 768`
  - `390 x 844`
- QA checks confirmed:
  - `/more` returned `200`.
  - no page errors or console errors were observed.
  - 50 photo cards were present.
  - the bottom gray chrome strip was gone (`::before` display `none`).
  - the `close` link was visible at all tested sizes.
  - click-to-enlarge and click-outside-close worked at all tested sizes.
  - screenshots were written to `temp/qa-more-*.png`.
- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed with 3 existing warnings:
  - missing dependency warning for `closePhotoDetail` in `src/components/photography-portfolio.tsx`.
  - two `@next/next/no-img-element` warnings in `src/components/photography-portfolio.tsx`.
- `npm.cmd run build` passed.
- Build route output included:
  - `/`
  - `/_not-found`
  - `/about`
  - `/more`
- Build warning still appears:
  - `metadataBase property in metadata export is not set... using "http://localhost:3000"`.
- This warning is not related to the `/more` animation.
- Browser visual verification through the in-app browser was blocked once by browser security policy for `http://localhost:3000`; do not treat that as app failure.

Latest preview recovery:

- `netstat -ano | Select-String ':3000'` showed port `3000` listening but `Invoke-WebRequest http://localhost:3000/` timed out.
- The stuck Node process was stopped.
- `npm.cmd run dev` was run again.
- After restart, `Invoke-WebRequest http://localhost:3000/` returned `STATUS=200`.
- If this happens again, first confirm:
  - port `3000` is listening.
  - shell request to `http://localhost:3000/` returns `200`.
  - the in-app browser is not showing a stale failed page.

Earlier checks:

- `npm run dev` successfully opened the site at `http://192.168.31.180:3000/`.
- Shell request to `http://192.168.31.180:3000/about` returned `200`.
- `src/data/portfolio-photos.json` was checked: public `src` paths existed and were ASCII-only.

## Recommended Visual QA

If validating manually:

- Ask the user to refresh their existing foreground `npm run dev` page.
- Do not start a second dev server.
- Check:
  - `http://192.168.31.180:3000/`
  - `http://192.168.31.180:3000/about`
  - `http://192.168.31.180:3000/more`

Useful viewport sizes:

- `1728 x 992`
- `1440 x 900`
- `1156 x 816`
- `1024 x 768`
- `390 x 844`

For `/more`, specifically inspect:

- Opening white page and central BIN loader.
- BIN loader should not remain faintly visible once photo stack appears.
- Intro stack should be concentrated in the center and visibly larger/solid, not tiny or washed out.
- First 12 images should form the layered center stack.
- After scatter, most intro photos should move out/offscreen.
- Only 2 hold photos should remain before continuous track drift.
- The 2 hold photos should directly continue into track motion, without a visible extra pull back to the track.
- Current opening/hold photos should be IDs `3` and `8`.
- No later track cards should appear extremely small.
- Photos entering the viewport should appear directly rather than visibly fading in.
- Photos should not one-frame flash from stale positions when entering the viewport.
- Click a visible photo:
  - original card should disappear immediately.
  - cloned preview should enlarge smoothly with no extra UI.
  - other track photos should continue moving while the enlarge tween runs.
  - track should pause after the enlarge finishes.
- Click outside the enlarged photo:
  - track should resume immediately.
  - preview should animate back toward the moving track position and hand off cleanly.
- Wheel down accelerates forward.
- Wheel up reverses temporarily.
- Wheel up should stop at the reverse blank-space limit, then forward drift should resume after the short hold.
- Motion decays and resumes slow forward drift.
- Footer chrome should show only `BIN` and a readable `close`; no `list` text and no gray horizontal strip.

## Recommended Next Steps

- If the user says `/more` images still feel too small, tune `widthVw`, `maxWidth`, and possibly route positions in `src/components/more-photo-field.tsx`.
- If the user says `/more` feels too empty, do not immediately increase visible density. First adjust route positions, `trackSegment`, `trackSlotSpacing`, or viewport culling margin.
- If the user wants original Brady Perron density again, ask whether they want more visible photos during track drift or only a denser intro stack.
- If the user wants different opening photos, change `introLeadPhotoIds` in `src/components/more-photo-field.tsx`.
- If the user gives real Xiaohongshu/Douyin links, replace placeholder social links in `src/app/about/page.tsx`.
- If the user sees stale visuals, verify the foreground `npm run dev` process on port `3000` before making more design changes.
- If restarting is needed, ask before killing any existing `3000` process.

## Historical Notes

- Older handoff entries mentioned preview port `3100`; that is now outdated for ordinary use.
- Older handoff entries mentioned a different `/about` layout with large serif `BIN`, right-side social links, or a `back` button; that is outdated.
- Earlier social text had mojibake in the handoff. Source display text should use proper Chinese if needed.
- The biggest recurring causes of wasted time were:
  - wrong preview port.
  - background/hidden server launches.
  - stale dev-server/browser state.
  - LAN Next dev-resource blocking.
  - non-ASCII public asset paths.
