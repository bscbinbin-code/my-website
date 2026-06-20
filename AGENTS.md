<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 Notice

This project uses Next.js 16 with breaking API and file-structure changes. Before framework-level edits, read the relevant guide under `node_modules/next/dist/docs/`.
<!-- END:nextjs-agent-rules -->

# Agent Rules

- Default to Chinese replies.
- Explain the purpose in plain language before code-related operations.
- State risks before modifying files, running commands, or accessing external accounts.
- Write tutorials as beginner-friendly steps and include success signs.
- Batch deletion is allowed only for clearly disposable project-local cache/temp artifacts after stating the exact target and risk.
- Allowed cleanup targets include `.next/`, `temp/`, local `*.log` files, root-level Playwright screenshot PNGs, and generated dev-server log files.
- Never delete source code, `Photos/`, `public/portfolio/photos/`, `public/portfolio/social/`, `src/`, `skills/`, `design-md-library/`, `node_modules/`, `.git/`, or user-provided assets unless the user explicitly names that exact target.
- If a cleanup target is ambiguous, stop and ask before deleting.

# Project

This is a personal photography portfolio site.

- Local preview: `npm run dev`
- Local URL: `http://localhost:3000/`
- LAN URL: `http://192.168.31.180:3000/`
- Main page: `src/app/page.tsx`
- Main component: `src/components/photography-portfolio.tsx`
- Main styles: `src/app/globals.css`
- Photo manifest: `src/data/portfolio-photos.json`
- Used assets: `public/portfolio/photos/`
- Original source photos: `Photos/` must stay ignored and unuploaded unless the user explicitly asks.

# Commands

- `npm run dev` - Start the foreground development server on port 3000.
- `npm run build` - Production build.
- `npm run lint` - ESLint check.
- `npm run typecheck` - TypeScript check.
- `npm run check` - lint + typecheck + build.

# Project Local Skills

These skills are installed only for this project under `skills/`, not globally. They may not appear in Codex's global skill list. When a user asks for one of these names or the task matches its purpose, read the listed `SKILL.md` fully before acting:

- `web-prototype`: `skills/web-prototype/SKILL.md` - desktop web prototype, landing page, homepage, marketing/docs single page.
- `saas-landing`: `skills/saas-landing/SKILL.md` - SaaS/product landing page with hero, features, pricing, and CTA.
- `mobile-app`: `skills/mobile-app/SKILL.md` - mobile app / iOS / Android / phone screen mockup.
- `hyperframes`: `skills/hyperframes/SKILL.md` - HTML video compositions, animations, captions, title cards, and transitions.

# Local Preview Stability

- Default preview is the foreground `npm run dev` process on port `3000`.
- Do not use `Start-Job`, `start /b`, `Start-Process`, hidden windows, or other background launch methods for the project preview unless the user explicitly asks.
- Do not close the shell that is running Next.js. Keep the dev server visible in the foreground.
- Before starting a new preview, check port `3000` first with `netstat -ano | Select-String ':3000'`.
- If port `3000` is listening but browser requests hang, treat it as a stuck Next process rather than a wrong URL.
- Prefer keeping the existing foreground preview process alive during visual tuning; repeated cold starts make the site feel slow.
- LAN preview should use `http://192.168.31.180:3000/`. `next.config.ts` should keep `allowedDevOrigins: ["192.168.31.180"]` so Next.js dev resources are not blocked.
- Avoid clearing `.next/` during ordinary preview troubleshooting. Clearing `.next/` forces a cold rebuild and should be reserved for suspected cache corruption after stating the exact path and risk.
- If `next dev` exits unexpectedly and the user asked to keep it running, restart the same foreground `npm run dev` command.
- The in-app browser can keep failed localhost connections in `CLOSE_WAIT` / `FIN_WAIT_2`. If it shows an old error page, first verify the server from PowerShell, then open a fresh tab or manually re-enter `http://localhost:3000/` or `http://192.168.31.180:3000/`.
- If a second preview process is occupying `3000`, ask before stopping it unless the user explicitly requested a restart.

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
- Cleanup is permitted for disposable project-local cache/temp artifacts listed in Agent Rules.
- Before deleting, print or report the exact path(s) and confirm they are inside `F:\Desktop\web-black`.
