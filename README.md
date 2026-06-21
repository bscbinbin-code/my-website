# BIN Photography Website

Personal photography portfolio built with Next.js 16, React 19, Tailwind CSS, and GSAP.

## Local Preview

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Check

```bash
npm run check
```

This runs lint, TypeScript, and the production build.

## Vercel Deploy

1. Import this GitHub repository in Vercel.
2. Keep the default framework preset as `Next.js`.
3. Add this environment variable:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

4. Deploy from the `main` branch.

## Notes

- Website assets used in production live under `public/portfolio/`.
- Original source assets in `Photos/` are intentionally ignored and should not be uploaded.
- Hero videos are already optimized and are referenced from `public/portfolio/videos/`.
