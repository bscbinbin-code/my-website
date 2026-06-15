# Hand Off

## 2026-06-16 Latest Handoff

### Current Preview

- Production preview has been used repeatedly because the dev server on `3000`/`3100` sometimes served stale output or hit Windows `spawn EPERM`.
- Latest successful preview command pattern:
  - `npm.cmd run build`
  - `node_modules\.bin\next.cmd start -p 3100`
- Last known restarted production preview:
  - `http://127.0.0.1:3100/`
  - PID from latest restart during avatar/about work: `8760`.
- If output appears stale, rebuild and restart `3100` before assuming source is wrong.
- The in-app browser recently blocked one direct `127.0.0.1:3100` verification with a browser security policy message. Do not try to bypass that policy; use normal user refresh or shell/build verification if it happens again.

### Final Page FUJIFILM / ABOUT State

- Final page still uses the white minimal sheet and four corner words:
  - `ALL`
  - `SHOT ON`
  - `FUJIFILM`
  - `XH2`
- The `FUJIFILM` hover state now uses an official wordmark image derived from the user-provided logo screenshot:
  - Original copied asset: `public/portfolio/brand/fujifilm-official-wordmark.png`
  - Transparent-background processed asset: `public/portfolio/brand/fujifilm-official-wordmark-transparent.png`
  - Current JSX source: `src/components/photography-portfolio.tsx`
  - Current CSS source: `src/app/globals.css`
- The transparent PNG was generated locally by making near-white pixels transparent. This removed the visible white rectangle around the logo.
- Reminder: the user explicitly accepted using the official FUJIFILM mark. It still carries trademark/authorization risk.
- The final-page `about` link is fixed at bottom right but only appears when the final words are revealed:
  - React state: `finalAboutVisible`
  - Set true in `revealFinalWords`
  - Set false in `hideFinalWords`
  - `prefers-reduced-motion: reduce` shows it immediately with final words.
- `about` is not a gray button now. It is a tiny serif text link in the lower-right corner, styled like the provided reference.
- Clicking it routes to `/about`.

### About Page Current State

- New route exists: `src/app/about/page.tsx`.
- Current `/about` layout:
  - Left-lower identity block: `ABOUT` and large serif `BIN`.
  - Right-side avatar image.
  - Right-side social link list with two placeholder links:
    - `小红书`
    - `抖音`
  - Bottom-right `back` link to `/`.
- The user asked to remove only the extra top/bottom contact elements:
  - Removed `( contact )`.
  - Removed `Photography / Archive / Daily Notes`.
  - Kept `小红书` and `抖音`.
- The user provided avatar source file:
  - `F:\Desktop\binbin yaya .jpg`
- Copied full avatar asset:
  - `public/portfolio/about/binbin-yaya.jpg`
- Cropped duck-only asset:
  - `public/portfolio/about/binbin-yaya-duck.jpg`
  - Crop used top portion only: `2481 x 2350`, removing the bottom `for bin` text.
- Current `/about` uses `binbin-yaya-duck.jpg`.
- Current CSS classes:
  - `.about-page`
  - `.about-page__content`
  - `.about-page__avatar`
  - `.about-page__social`
  - `.about-page__back`
- The social links currently use `href="#"` placeholders. Replace them once the user provides real Xiaohongshu/Douyin URLs.

### Recent Verification

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed with the same 3 existing warnings:
  - missing dependency warning for `closePhotoDetail`,
  - two `@next/next/no-img-element` warnings in `src/components/photography-portfolio.tsx`.
- `npm.cmd run build` passed and includes:
  - `/`
  - `/_not-found`
  - `/about`
- Browser verification before the latest security block confirmed:
  - About button hidden initially and visible on final page reveal.
  - About route renders.
  - Avatar image was previously loaded at `/about`.
- After the final duck-only crop/social-list change, shell verification and build passed; browser verification was not repeated because of the prior browser security block.

### Current Files Most Relevant

- `src/components/photography-portfolio.tsx`
- `src/app/globals.css`
- `src/app/about/page.tsx`
- `public/portfolio/brand/fujifilm-official-wordmark.png`
- `public/portfolio/brand/fujifilm-official-wordmark-transparent.png`
- `public/portfolio/about/binbin-yaya.jpg`
- `public/portfolio/about/binbin-yaya-duck.jpg`
- `public/portfolio/videos/web7.mp4`

### Notes For Next Agent

- Do not delete or crop the original `F:\Desktop\binbin yaya .jpg`.
- Do not remove `小红书` / `抖音`; user specifically clarified those should remain.
- Do remove/keep removed the extra `( contact )` label and bottom descriptive line on `/about`.
- The `/about` page should remain quiet and minimal, with large negative space.
- If adding real social links later, replace the `href="#"` placeholders in `src/app/about/page.tsx`.
- Avoid reintroducing the old QR-code popover on the homepage unless the user explicitly asks.
- Avoid making the `about` link global; it should appear only on the final page when the final text appears.

## 2026-06-13 Latest Handoff

### Current Preview

- Project documented preview URL: `http://localhost:3100/`.
- Preview command: `npm.cmd run dev:local`.
- User has also run a local preview at `http://localhost:3000/` during the latest camera/hero-video work.
- If checking visuals, first confirm which preview server is currently active before assuming stale output.
- `.next/` was cleared a few times because Next/Turbopack served stale CSS after edits. This was only cache cleanup, not source deletion.

### Final Page Current Direction

- Final page target: a white minimal sheet rising from the dark gallery background.
- The dark background behind the final sheet now inherits the gallery's black photographic language:
  - dark layered gradients,
  - subtle scanline texture,
  - soft gallery-like light haze,
  - no photo reflection.
- The previous standalone gray block was removed because it felt visually disconnected from the gallery.

### Final Sheet Motion

- Final sheet is implemented in `src/components/photography-portfolio.tsx` and styled in `src/app/globals.css`.
- Current final section markup:
  - `.photo-final-spread`
  - `.photo-final-sheet`
  - `.photo-final-minimal`
  - four text spans: `ALL`, `SHOT ON`, `FUJIFILM`, `XH2`
- Current motion goal:
  - Keep the white page rising from below.
  - Add some weight/drag, but avoid the overly slow/strange version.
- Current tuned values:
  - `.photo-final-spread` desktop height: `252svh`.
  - Mobile final height: `224svh`.
  - `.photo-final-sheet` initial transform: `translate3d(0, min(72svh, 760px), 0)`.
  - JS sheet lift: `Math.min(window.innerHeight * 0.72, 760)`.
  - Sheet ScrollTrigger scrub: `1.35`.
  - Sheet scroll range: `start: "top bottom"`, `end: "top -62%"`.
  - User explicitly asked not to revert this section back to the older handoff values.

### Final Text Logic

- Current behavior:
  - Sheet rise remains scroll-driven.
  - Final words are revealed from the final ScrollTrigger progress.
  - Center X-H2 product image is independent of scroll reveal and appears only on `XH2` hover/pointer enter.
  - If user scrolls back before the reveal range, text fades out again.
- Relevant functions in `src/components/photography-portfolio.tsx`:
  - `revealFinalWords`
  - `hideFinalWords`
- Current reveal threshold:
  - Reveal when final ScrollTrigger progress is `>= 0.76`.
  - Hide when final ScrollTrigger progress is `<= 0.48`.

### Verification Done Today

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed with the same 3 existing warnings:
  - missing dependency warning for `closePhotoDetail`,
  - two `@next/next/no-img-element` warnings.
- Latest final-sheet source values were confirmed from `src/components/photography-portfolio.tsx` and `src/app/globals.css`:
  - final spread: `252svh` desktop / `224svh` mobile,
  - final sheet transform: `min(72svh, 760px)`,
  - JS sheet lift: `Math.min(window.innerHeight * 0.72, 760)`,
  - final trigger range: `end: "top -62%"`,
  - scrub: `1.35`.

### Notes For Next Agent

- Do not reintroduce the previous reflection/photo echo under the final page. User disliked it.
- Do not make the final page extremely slow again. The `360svh / 58svh / scrub 3.25` version felt strange and was rolled back.
- If browser output does not match source edits, suspect stale `.next/` cache or stale dev server first.
- If clearing cache is needed, only clear `F:\Desktop\web-black\.next` after stating the risk.
- The final page should feel like a weighted white sheet entering the same dark gallery space, not like a separate gray section.

## Project Context

- Project: BIN personal photography portfolio site.
- Local preview currently used by user: `http://localhost:3100/`.
- Project documented preview command: `npm.cmd run dev:local` on `http://127.0.0.1:3100/`.
- Main page: `src/app/page.tsx`.
- Main component: `src/components/photography-portfolio.tsx`.
- Main styles: `src/app/globals.css`.
- Photo manifest: `src/data/portfolio-photos.json`.

## Current Design Direction

- Overall site remains a BIN-branded photography portfolio.
- Intro/hero/gallery are dark, cinematic, photography-led.
- Final page has been changed away from the earlier black bulge/particle effect.
- Final page target is now a white, minimal, high-fashion layout inspired by the provided reference.

## Recent Completed Work

- Hero video was updated to the current selected source:
  - `Photos/web7.mp4` was copied to `public/portfolio/videos/web7.mp4`.
  - Current hero video source is `/portfolio/videos/web7.mp4` in `src/components/photography-portfolio.tsx`.
  - Old public video files were deleted from `public/portfolio/videos/`:
    - `web-hero.mp4`
    - `web.mp4`
    - `web2.mp4`
    - `web3.mp4`
    - `web4.mp4`
    - `web5.mp4`
    - `web6.mp4`
  - `public/portfolio/videos/` currently contains only `web7.mp4`.
- Final page was replaced with a minimal white page:
  - Removed use of `BulgeTextEffect` from `src/components/photography-portfolio.tsx`.
  - Final section now renders `.photo-final-minimal`.
  - Text is split into four words/phrases:
    - `ALL`
    - `SHOT ON`
    - `FUJIFILM`
    - `XH2`
  - These are positioned as four corners of a central square area.
- Final page responsive behavior was adjusted:
  - Uses a `vmin`-based central square so wide screens do not make text collide.
  - Uses absolute corner positioning instead of grid placement.
  - Mobile has smaller font/container sizing.
- Final page X-H2 camera display was changed:
  - Earlier Three.js / CSS-like camera body experiments were removed from `src/components/photography-portfolio.tsx`.
  - The page now uses a real FUJIFILM X-H2 white-background product image.
  - Source image is `public/portfolio/camera/xh2-front-cmos.webp`.
  - The center camera image is hidden by default.
  - Hovering the `XH2` word sets the preview visible via React pointer/mouse enter/leave handlers.
  - The image uses `.photo-final-camera-product` and `.photo-final-camera-product-frame` styling in `src/app/globals.css`.
  - Recent correction: do not crop off the X-H2 prism/EVF hump. Current CSS keeps the full product image visible with centered `width: 100%` instead of an over-cropped enlarged image.
  - Centering correction: `.photo-final-artifact` uses `inset: 0; margin: auto;` so GSAP transforms cannot break geometric centering.

## Verification Done

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed with 3 existing warnings in `src/components/photography-portfolio.tsx`.
- Latest verification after switching to `web7.mp4`:
  - `npm.cmd run typecheck` passed.
  - `public/portfolio/videos/` was checked and contains only `web7.mp4`.
  - Source search found the only public video reference as `/portfolio/videos/web7.mp4`.
- Browser/layout verification for the final X-H2 preview:
  - Product figure and four-word layout center were measured with `delta x = 0`, `delta y = 0` after the centering fix.
  - Browser automation did not reliably trigger actual hover, but the code uses both mouse and pointer enter/leave handlers for the `XH2` word.
- Final page responsive checks were run at:
  - `971 x 1045`
  - `1440 x 900`
  - `390 x 844`
- In those checks, the four final-page words stayed inside the central square and did not overlap.

## Known Warnings

`npm.cmd run lint` still reports 3 warnings that were already present:

- Missing dependency warning for `closePhotoDetail`.
- Two `@next/next/no-img-element` warnings for existing image usage.

These were not introduced by the final-page/video changes.

## Important Notes

- `public/portfolio/videos/web7.mp4` is a large file, about 92 MB.
- Old public video files were deleted intentionally per user request after copying in `web7.mp4`.
- `Photos/` original source files were not deleted or modified.
- `src/components/bulge-text-effect.tsx` still exists but is no longer imported by `photography-portfolio.tsx`.
- The working tree already had unrelated modified files before some of this work. Do not revert unrelated changes unless the user explicitly asks.

## Current Files Most Relevant To Recent Work

- `src/components/photography-portfolio.tsx`
- `src/app/globals.css`
- `public/portfolio/videos/web7.mp4`
- `public/portfolio/camera/xh2-front-cmos.webp`
- `src/components/bulge-text-effect.tsx`
