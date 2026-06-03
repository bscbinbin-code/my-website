<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer Template

## What This Is
A reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — just run `/clone-website <url1> [<url2> ...]`.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — will be replaced/supplemented by extracted SVGs)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters

## Project Structure
```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts        # cn() utility (shadcn)
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
scripts/            # Asset download scripts
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing `.claude/skills/clone-website/SKILL.md`, run `node scripts/sync-skills.mjs` to regenerate the skill for all platforms.

@docs/research/INSPECTION_GUIDE.md

## Current Project Context

This repository is currently a personal photography portfolio site, not only a generic reverse-engineering template.

- **Local preview:** `npm.cmd run dev:local`
- **Preview URL:** `http://127.0.0.1:3100/`
- **Main page:** `src/app/page.tsx`
- **Main component:** `src/components/photography-portfolio.tsx`
- **Intro / hero styles:** `src/app/globals.css`
- **Photo manifest:** `src/data/portfolio-photos.json`
- **Used photo assets:** `public/portfolio/photos/`
- **Original local source photos:** `Photos/` and should stay ignored/unuploaded unless the user explicitly says otherwise.

## Current Visual Goal

The homepage intro is being tuned to reference Kookie Kollective:

- Reference site: `https://www.kookie-kollective.com/`
- Desired intro sequence:
  1. Full black screen.
  2. Small, centered, premium-looking `BIN` wordmark appears in white.
  3. The wordmark holds briefly when fully clear.
  4. It transitions into a transparent / hollow mask stage.
  5. Only the hollow text area reveals the site behind it; the rest of the screen remains black.
  6. The hollow wordmark remains visibly aligned with an outline.
  7. The wordmark pushes forward and exits the screen.
  8. The full homepage is revealed.

The latest implementation uses a single SVG coordinate system for the intro wordmark:

- `introWordRef`: solid SVG `BIN`
- `introOutlineRef`: outline SVG `BIN`
- `introMaskTextRef`: SVG mask text used to cut through the black mask
- `introMaskRef`: black SVG rect using the text mask

Keep these layers aligned by sharing the same coordinates:

- `x="600"`
- `y="522"`
- `textAnchor="middle"`
- `dominantBaseline="middle"`

The GSAP transform center should also stay matched:

```ts
translate(600 522) scale(...) translate(-600 -522)
```

If the intro feels wrong, first tune these values instead of splitting the layers into separate HTML elements:

- SVG `y`
- `.photo-intro-svg text` `font-size`
- `letter-spacing`
- outline `stroke-width`
- GSAP timeline durations/eases/scale

## Current Homepage Implementation Notes

The site is a personal photography portfolio. The current homepage flow is:

1. Kookie-style intro animation with the `BIN` wordmark.
2. Full-screen hero image with large split `B`, `I`, `N` letters across the viewport.
3. Location / tube-text section rendered by `src/components/tube-text-scroll.tsx`.
4. Work / gallery section with Kookie-inspired dark motion-blur background, HUD details, soft-blurred `MY WORK` title, floating photo cards, animated captions, and red scroll glow.

Important implementation details:

- Main React component: `src/components/photography-portfolio.tsx`.
- Main visual styling and keyframes: `src/app/globals.css`.
- Gallery data comes from `src/data/portfolio-photos.json`.
- Displayed photo assets live under `public/portfolio/photos/`.
- Raw local source photos in `Photos/` should remain ignored and should not be uploaded unless the user explicitly asks.
- `about-float` / `about-social-panel` are currently placeholder UI for About Me / social info; QR content is still placeholder text.
- The gallery uses GSAP + ScrollTrigger. Do not reintroduce whole-page wheel hijacking or `preventDefault` scroll inertia, because it previously made the entire site feel unreasonable. Prefer local ScrollTrigger scrub, CSS transforms, and scoped velocity effects.
- The gallery red glow is driven by the CSS variable `--scroll-glow` on `.photo-gallery-scene`.
- Caption / bottom strip animation should stay linked to each `.photo-card` timeline so the strip moves together with the photo frame.

## Current Visual Targets

Reference site: `https://www.kookie-kollective.com/`

The user wants a Kookie-inspired feel, customized for `BIN`:

- Intro: black screen, premium `BIN`, hollow/masked reveal, then wordmark pushes forward off-screen.
- Hero: full-screen image with oversized `B`, `I`, `N` spread across the top/viewport, similar to Kookie's oversized wordmark.
- Work section: dark grayscale motion-blur background, HUD/REC details, soft white blurred `MY WORK` title, floating photo cards, red glow while scrolling, and smooth but not excessive inertia.
- Visual changes should prioritize matching the reference first. Avoid adding unrelated personal aesthetic changes during this tuning phase.

## Visual QA / Browser Preview

Playwright has been installed for local visual checks:

- Dev dependency: `playwright`
- Browser installed: Chromium via `npx.cmd playwright install chromium`
- Screenshot test already succeeded by launching Chromium outside the sandbox and saving `playwright-preview.png`.

Because launching Chromium from the Node REPL may fail with Windows `EPERM`, use an escalated PowerShell command when a screenshot is needed. Example pattern:

```powershell
@'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1206, height: 1050 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:3100/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'playwright-preview.png', type: 'png', fullPage: false });
  await browser.close();
})();
'@ | node
```

For work-section checks, scroll the page with Playwright before taking screenshots rather than relying only on the in-app browser view.

## Local Workflow Notes

- Before making Next.js API or framework-level changes, read the relevant docs under `node_modules/next/dist/docs/` because this project uses Next.js 16.
- For GSAP animation work, use the installed local GSAP skills as guidance, especially `gsap-core`, `gsap-timeline`, `gsap-react`, and `gsap-scrolltrigger`.
- Do not batch-delete directories. If temporary folders such as `skill-install-extract/` need cleanup, ask the user to delete them manually.
- `scripts/sync-agent-rules.sh` is referenced above, but may not exist in this checkout. If it is missing, report that instead of trying to run it.
