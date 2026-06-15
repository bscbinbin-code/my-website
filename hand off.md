# Hand Off

## 2026-06-13 Latest Handoff

### Current Preview

- Current active preview URL: `http://localhost:3100/`.
- Preview command: `npm.cmd run dev:local`.
- During visual tuning, `localhost:3000` was found serving stale Next dev output. The active project preview was moved back to the documented `3100` port.
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
  - `.photo-final-spread` desktop height: `248svh`.
  - Mobile final height: `232svh`.
  - `.photo-final-sheet` initial transform: `translate3d(0, min(50svh, 520px), 0)`.
  - JS sheet lift: `Math.min(window.innerHeight * 0.5, 520)`.
  - Sheet ScrollTrigger scrub: `2.35`.
  - Sheet scroll range: `start: "top bottom"`, `end: "top -58%"`.
  - `riseDistance`: `window.innerHeight * 1.48`.
  - velocity drift clamp: `-7px` to `7px`.

### Final Text Logic

- Important recent change: final text no longer depends on continued downward scrolling.
- Problem fixed: user could stop on a full white page and see no text.
- New behavior:
  - Sheet rise remains scroll-driven.
  - Text reveal is triggered by sheet position.
  - When the white sheet is basically in place, text auto-fades in even if the user stops scrolling.
  - If user scrolls back and the sheet moves away, text fades out again.
- Relevant functions in `src/components/photography-portfolio.tsx`:
  - `revealFinalWords`
  - `hideFinalWords`
- Current reveal threshold:
  - Reveal when estimated sheet top is `<= window.innerHeight * 0.18`.
  - Hide when estimated sheet top is `>= window.innerHeight * 0.42`.
- Browser verification confirmed that stopping near the final white page causes text opacity to rise to about `0.92 - 0.98` after roughly 1.4 seconds.

### Verification Done Today

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed with the same 3 existing warnings:
  - missing dependency warning for `closePhotoDetail`,
  - two `@next/next/no-img-element` warnings.
- Browser verified on `http://localhost:3100/`.
- Service CSS was confirmed after cache cleanup:
  - final spread: `248svh`,
  - final sheet transform: `min(50svh, 520px)`.

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

- Hero video was updated twice:
  - `Photos/WEB5.mp4` was copied to `public/portfolio/videos/web5.mp4`.
  - Later `Photos/web6.mp4` was copied to `public/portfolio/videos/web6.mp4`.
  - Current hero video source is `/portfolio/videos/web6.mp4` in `src/components/photography-portfolio.tsx`.
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

## Verification Done

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed with 3 existing warnings in `src/components/photography-portfolio.tsx`.
- Browser verified hero video loads:
  - `http://localhost:3000/portfolio/videos/web6.mp4`
  - Video `readyState` was `4`.
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

- `public/portfolio/videos/web5.mp4` and `public/portfolio/videos/web6.mp4` are large files, about 91 MB each.
- Old video files were not deleted.
- `Photos/` original source files were not deleted or modified.
- `src/components/bulge-text-effect.tsx` still exists but is no longer imported by `photography-portfolio.tsx`.
- The working tree already had unrelated modified files before some of this work. Do not revert unrelated changes unless the user explicitly asks.

## Current Files Most Relevant To Recent Work

- `src/components/photography-portfolio.tsx`
- `src/app/globals.css`
- `public/portfolio/videos/web6.mp4`
- `public/portfolio/videos/web5.mp4`
- `src/components/bulge-text-effect.tsx`
