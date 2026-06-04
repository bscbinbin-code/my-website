<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 Notice

This project uses Next.js 16 with breaking API and file-structure changes. Before framework-level edits, read the relevant guide under `node_modules/next/dist/docs/`.
<!-- END:nextjs-agent-rules -->

# Agent Rules

- Default to Chinese replies.
- Explain the purpose in plain language before code-related operations.
- State risks before modifying files, running commands, or accessing external accounts.
- Write tutorials as beginner-friendly steps and include success signs.
- Do not batch-delete files or directories. If batch cleanup is needed, stop and ask the user to delete them manually.

# Project

This is a personal photography portfolio site.

- Local preview: `npm.cmd run dev:local`
- Preview URL: `http://127.0.0.1:3100/`
- Main page: `src/app/page.tsx`
- Main component: `src/components/photography-portfolio.tsx`
- Main styles: `src/app/globals.css`
- Photo manifest: `src/data/portfolio-photos.json`
- Used assets: `public/portfolio/photos/`
- Original source photos: `Photos/` must stay ignored and unuploaded unless the user explicitly asks.

# Commands

- `npm run dev:local` - Start local preview on port 3100.
- `npm run build` - Production build.
- `npm run lint` - ESLint check.
- `npm run typecheck` - TypeScript check.
- `npm run check` - lint + typecheck + build.

# Code Style

- TypeScript strict mode, no `any`.
- Named exports, PascalCase components, camelCase utilities.
- Tailwind utilities, no inline styles unless there is a strong existing reason.
- 2-space indentation.
- Mobile-first responsive behavior.

# Current Visual Direction

Reference site: `https://www.kookie-kollective.com/`

The homepage is being tuned toward a Kookie-inspired but BIN-branded photography portfolio:

- Intro: black screen, small premium white `BIN`, hollow/masked reveal, then forward exit.
- Hero: full-screen image with oversized split `B`, `I`, `N`.
- Location section: `src/components/tube-text-scroll.tsx`.
- Work/gallery: dark grayscale motion-blur mood, HUD/REC details, soft blurred `MY WORK`, floating photo cards, red scroll glow, smooth but not excessive motion.

# Intro Alignment Notes

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

If the intro feels wrong, first tune SVG `y`, font size, letter spacing, outline stroke width, and GSAP durations/eases/scale before splitting layers into separate HTML elements.

# Implementation Notes

- The gallery uses GSAP + ScrollTrigger.
- Do not reintroduce whole-page wheel hijacking or `preventDefault` scroll inertia.
- Prefer local ScrollTrigger scrub, CSS transforms, and scoped velocity effects.
- Gallery red glow is driven by `--scroll-glow` on `.photo-gallery-scene`.
- Caption/bottom strip animation should remain linked to each `.photo-card` timeline.
- `about-float` and `about-social-panel` currently include placeholder About/social UI.

# Visual QA

Playwright is installed for local screenshots. If Node REPL Chromium launch fails with Windows `EPERM`, use an escalated PowerShell command for screenshots.

Keep generated screenshots out of the repo root when possible. Prefer `temp/` or another ignored local folder.

# Local Cleanup Notes

- `scripts/sync-agent-rules.sh` may not exist in this checkout. If it is missing after editing this file, report that instead of trying to run it.
- Do not batch-delete temporary folders such as `skill-install-extract/`; ask the user to delete them manually if cleanup is needed.
