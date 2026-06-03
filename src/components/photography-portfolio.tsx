"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import photos from "@/data/portfolio-photos.json";
import { TubeTextScroll } from "@/components/tube-text-scroll";

type PortfolioPhoto = {
  id: number;
  title: string;
  originalName: string;
  city: string;
  src: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "square";
  ratio: number;
};

type GalleryItem = PortfolioPhoto & {
  layout: {
    gridColumn: string;
    offset: number;
    width: number;
    shift: number;
    zIndex: number;
    depth: number;
    tilt: number;
  };
};

const portfolioPhotos = photos as PortfolioPhoto[];

const galleryLayoutPattern = [
  { gridColumn: "1 / span 4", offset: 0, width: 96, shift: -2, tilt: -0.08 },
  { gridColumn: "7 / span 4", offset: 10, width: 98, shift: 1, tilt: 0.05 },
  { gridColumn: "3 / span 4", offset: -6, width: 90, shift: 4, tilt: -0.04 },
  { gridColumn: "9 / span 4", offset: -18, width: 96, shift: -4, tilt: 0.04 },
  { gridColumn: "1 / span 5", offset: -10, width: 88, shift: 0, tilt: -0.05 },
  { gridColumn: "6 / span 4", offset: -22, width: 94, shift: 3, tilt: 0.06 },
  { gridColumn: "9 / span 3", offset: -8, width: 88, shift: -2, tilt: -0.03 },
  { gridColumn: "2 / span 4", offset: -24, width: 92, shift: 2, tilt: 0.04 },
] as const;

function getGalleryCardWidth(photo: PortfolioPhoto, patternWidth: number) {
  if (photo.ratio >= 2.3) return Math.min(100, patternWidth + 10);
  if (photo.ratio >= 1.75) return Math.min(100, patternWidth + 5);
  if (photo.orientation === "portrait") return Math.max(68, patternWidth - 12);
  if (photo.orientation === "square") return Math.max(74, patternWidth - 6);
  return patternWidth;
}

function HudCorners() {
  return (
    <span className="photo-hud-corners" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function HeroHud() {
  return (
    <div className="photo-hero-hud" aria-hidden="true">
      <div className="photo-hero-caption">
        <span>BIN</span>
        <i />
        <strong>PHOTO PORTFOLIO</strong>
      </div>
      <div className="photo-hero-scroll">
        <span />
      </div>
      <div className="photo-hero-rec">
        <span>REC</span>
      </div>
    </div>
  );
}

export function PhotographyPortfolio() {
  const [aboutReady, setAboutReady] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const introWordRef = useRef<SVGTextElement>(null);
  const introOutlineRef = useRef<SVGTextElement>(null);
  const introMaskRef = useRef<SVGRectElement>(null);
  const introMaskTextRef = useRef<SVGTextElement>(null);
  const siteContentRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const aboutAnchorRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const galleryPhotos = useMemo<GalleryItem[]>(() => {
    const nextPhotos = [...portfolioPhotos];
    const firstIndex = nextPhotos.findIndex((photo) => photo.id === 36);
    const secondIndex = nextPhotos.findIndex((photo) => photo.id === 39);

    if (firstIndex >= 0 && secondIndex >= 0) {
      [nextPhotos[firstIndex], nextPhotos[secondIndex]] = [nextPhotos[secondIndex], nextPhotos[firstIndex]];
    }

    return nextPhotos.map((photo, index) => {
      const pattern = galleryLayoutPattern[index % galleryLayoutPattern.length];
      const depth = 0.96 + (index % 5) * 0.035;
      const row = Math.floor(index / galleryLayoutPattern.length);
      const width = getGalleryCardWidth(photo, pattern.width);
      const zIndex = 4 + (index % 4);

      return {
        ...photo,
        layout: {
          gridColumn: pattern.gridColumn,
          offset: pattern.offset + (row % 2 === 0 ? 0 : 8),
          width,
          shift: pattern.shift,
          zIndex,
          depth,
          tilt: pattern.tilt,
        },
      };
    });
  }, []);
  const featuredPhotoIds = useMemo(() => {
    return new Set(
      portfolioPhotos
        .filter((photo) => photo.ratio >= 2.3)
        .map((photo) => photo.id),
    );
  }, []);
  const widePhotoIds = useMemo(() => new Set(portfolioPhotos.filter((photo) => photo.ratio >= 1.75).map((photo) => photo.id)), []);

  useEffect(() => {
    if (!aboutOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAboutOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen]);

  useEffect(() => {
    const section = locationsRef.current;
    const anchor = aboutAnchorRef.current;
    if (!section || !anchor) return;

    let frame = 0;
    const updateReady = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const stickyTop = Number.parseFloat(window.getComputedStyle(anchor).top) || 0;
      const nextReady = rect.top <= stickyTop + 2 && rect.bottom > stickyTop + 96;

      setAboutReady(nextReady);
      if (!nextReady) setAboutOpen(false);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateReady);
    };

    updateReady();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const intro = introRef.current;
    const introWord = introWordRef.current;
    const introOutline = introOutlineRef.current;
    const introMask = introMaskRef.current;
    const introMaskText = introMaskTextRef.current;
    const siteContent = siteContentRef.current;
    if (!intro || !introWord || !introOutline || !introMask || !introMaskText || !siteContent) return;

    let cleanup = () => {};
    let cancelled = false;

    const init = async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const ctx = gsap.context(() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const previousBodyOverflow = document.body.style.overflow;

        if (reduceMotion) {
          gsap.set(siteContent, { autoAlpha: 1 });
          gsap.set(intro, { autoAlpha: 0 });
          return;
        }

        document.body.style.overflow = "hidden";
        gsap.set(siteContent, { autoAlpha: 1, visibility: "visible" });
        gsap.set(intro, { autoAlpha: 1 });
        gsap.set(introMask, { autoAlpha: 1 });
        gsap.set([introWord, introOutline, introMaskText], {
          attr: { transform: "translate(600 522) scale(1) translate(-600 -522)" },
          transformOrigin: "50% 50%",
        });
        gsap.set(introWord, {
          autoAlpha: 0,
          filter: "none",
        });
        gsap.set(introOutline, {
          autoAlpha: 0,
          filter: "none",
        });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            document.body.style.overflow = previousBodyOverflow;
          },
        });

        tl.to(introWord, {
          autoAlpha: 1,
          duration: 0.42,
        })
          .to(introWord, {
            duration: 0.22,
          })
          .to(
            introWord,
            {
              autoAlpha: 0,
              duration: 0.18,
              ease: "power1.out",
            },
            ">",
          )
          .to(
            intro,
            {
              backgroundColor: "rgb(0 0 0 / 0)",
              duration: 0.28,
              ease: "power2.out",
            },
            "<",
          )
          .to(
            introOutline,
            {
              autoAlpha: 0.92,
              duration: 0.2,
              ease: "power1.out",
            },
            "<",
          )
          .to({}, {
            duration: 0.16,
          })
          .to(
            introOutline,
            {
              duration: 0.96,
              ease: "expo.in",
              filter: "blur(2px)",
              attr: { transform: "translate(600 522) scale(24) translate(-600 -522)" },
            },
          )
          .to(
            introMaskText,
            {
              duration: 0.96,
              ease: "expo.in",
              attr: { transform: "translate(600 522) scale(24) translate(-600 -522)" },
            },
            "<",
          )
          .to(
            [introOutline, introMask],
            {
              autoAlpha: 0,
              duration: 0.2,
              ease: "power1.out",
            },
            ">-=0.16",
          )
          .to(
            intro,
            {
              autoAlpha: 0,
              duration: 0.36,
              ease: "power2.out",
            },
            "<",
          );

        return () => {
          document.body.style.overflow = previousBodyOverflow;
        };
      });

      cleanup = () => ctx.revert();
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    const section = galleryRef.current;
    if (!section) return;

    const workTitle = section.querySelector<HTMLElement>(".photo-gallery-title");
    const cards = [...section.querySelectorAll<HTMLElement>(".photo-card")];
    let cleanup = () => {};
    let cancelled = false;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        let resetGlow: { kill: () => void } | undefined;

        mm.add(
          {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            desktop: "(min-width: 901px)",
          },
          (context) => {
            const { reduceMotion, desktop } = context.conditions ?? {};

            if (reduceMotion) {
              if (workTitle) gsap.set(workTitle, { autoAlpha: 1, clearProps: "transform,filter" });
              gsap.set(cards, { autoAlpha: 1, clearProps: "transform" });
              return;
            }

            const glowTo = gsap.quickTo(section, "--scroll-glow", {
              duration: 0.42,
              ease: "power3.out",
            });
            let lastScrollY = window.scrollY;
            let lastTime = performance.now();
            const updateGlow = () => {
              const now = performance.now();
              const deltaTime = Math.max(16, now - lastTime);
              const velocity = Math.abs(window.scrollY - lastScrollY) / deltaTime;
              const glow = Math.min(1, velocity / 1.85);

              glowTo(glow);
              resetGlow?.kill();
              resetGlow = gsap.delayedCall(0.14, () => glowTo(0));
              lastScrollY = window.scrollY;
              lastTime = now;
            };

            gsap.set(section, { "--scroll-glow": 0 });
            window.addEventListener("scroll", updateGlow, { passive: true });

            if (workTitle) {
              gsap.set(workTitle, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              });

              gsap
                .timeline({
                  defaults: { ease: "none" },
                  scrollTrigger: {
                    trigger: section,
                    start: "top 92%",
                    end: "top -220%",
                    scrub: 0.58,
                    invalidateOnRefresh: true,
                  },
                })
                .fromTo(
                  workTitle,
                  {
                    autoAlpha: 0.72,
                    y: () => window.innerHeight * 0.58,
                    scale: 0.92,
                    filter: "blur(16px)",
                  },
                  {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.34,
                  },
                  0,
                )
                .to(
                  workTitle,
                  {
                    autoAlpha: 0.97,
                    scale: 0.992,
                    filter: "blur(5px)",
                    duration: 0.2,
                  },
                  0.48,
                )
                .to(
                  workTitle,
                  {
                    autoAlpha: 0.88,
                    scale: 0.975,
                    filter: "blur(18px)",
                    duration: 0.34,
                  },
                  0.64,
                );
            }

            cards.forEach((card, index) => {
              const caption = card.querySelector<HTMLElement>("figcaption");
              const captionText = caption?.querySelector<HTMLElement>("em");
              const depth = Number(card.dataset.depth || 1);
              const lane = index % 6;
              const baseShift = Number(card.dataset.shift || 0);
              const enterY = desktop ? 18 : 14;
              const leaveY = desktop ? -14 : -10;
              const baseRotation = Number(card.dataset.tilt || 0);

              const cardTimeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: card,
                  start: "top 112%",
                  end: "bottom 34%",
                  scrub: 0.56 + depth * 0.1,
                  invalidateOnRefresh: true,
                },
              });

              cardTimeline.fromTo(
                card,
                {
                  autoAlpha: 0,
                  xPercent: baseShift,
                  x: 0,
                  y: () => enterY * depth + lane * 2,
                  scale: 0.982,
                  rotation: baseRotation,
                  transformOrigin: "50% 50%",
                },
                {
                  autoAlpha: 1,
                  xPercent: baseShift,
                  x: 0,
                  y: () => Math.round((enterY * 0.08 + lane) * depth),
                  scale: 1,
                  rotation: baseRotation,
                  duration: 0.18,
                },
                0,
              ).to(
                card,
                {
                  y: () => leaveY * depth - lane * 7,
                  scale: 1.008,
                  duration: 0.82,
                },
                0.18,
              );

              if (caption && captionText) {
                cardTimeline
                  .fromTo(
                    caption,
                    {
                      autoAlpha: 0,
                      y: 44,
                      scaleY: 0.62,
                      transformOrigin: "50% 0%",
                      "--caption-sheen": "-120%",
                    },
                    {
                      autoAlpha: 1,
                      y: 0,
                      scaleY: 1,
                      "--caption-sheen": "120%",
                      duration: 0.5,
                      ease: "power2.out",
                    },
                    0,
                  )
                  .fromTo(
                    captionText,
                    {
                      autoAlpha: 0,
                      y: 20,
                      filter: "blur(9px)",
                    },
                    {
                      autoAlpha: 1,
                      y: 0,
                      filter: "blur(0px)",
                      duration: 0.42,
                      ease: "power2.out",
                    },
                    0.08,
                  );
              }
            });

            ScrollTrigger.refresh();

            return () => {
              resetGlow?.kill();
              window.removeEventListener("scroll", updateGlow);
            };
          },
        );

        return () => mm.revert();
      }, section);

      cleanup = () => ctx.revert();
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <main className="photo-site">
      <div className="photo-intro-overlay" ref={introRef} aria-hidden="true">
        <svg className="photo-intro-svg" viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <mask
              id="photo-intro-bin-mask"
              x="-12000"
              y="-12000"
              width="24000"
              height="24000"
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              mask-type="luminance"
            >
              <rect x="-12000" y="-12000" width="24000" height="24000" fill="white" />
              <text ref={introMaskTextRef} x="600" y="522" fill="black" textAnchor="middle" dominantBaseline="middle">
                BIN
              </text>
            </mask>
          </defs>
          <rect
            ref={introMaskRef}
            x="-12000"
            y="-12000"
            width="24000"
            height="24000"
            fill="black"
            mask="url(#photo-intro-bin-mask)"
          />
          <text className="photo-intro-word" ref={introWordRef} x="600" y="522" textAnchor="middle" dominantBaseline="middle">
            BIN
          </text>
          <text className="photo-intro-outline" ref={introOutlineRef} x="600" y="522" textAnchor="middle" dominantBaseline="middle">
            BIN
          </text>
        </svg>
      </div>

      <div className="photo-site-content" ref={siteContentRef}>
        <section id="top" className="photo-hero">
          <div className="photo-hero-media">
            <video
              src="/portfolio/videos/web3.mp4"
              poster={portfolioPhotos[0].src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="BIN portfolio hero video"
            />
            <HudCorners />
          </div>
          <HeroHud />
          <div className="photo-hero-title" aria-hidden="true">
            <span>B</span>
            <span>I</span>
            <span>N</span>
          </div>
        </section>

        <div id="locations" ref={locationsRef}>
          <div className="about-float-anchor" ref={aboutAnchorRef}>
            <button
              className={`about-float${aboutReady ? " is-visible" : ""}${aboutOpen ? " is-open" : ""}`}
              type="button"
              aria-expanded={aboutOpen}
              aria-controls="about-social-panel"
              onClick={() => setAboutOpen((open) => !open)}
            >
              <span>ABOUT ME</span>
              <i aria-hidden="true" />
            </button>

            <div
              className={`about-social-panel${aboutReady && aboutOpen ? " is-open" : ""}`}
              id="about-social-panel"
              role="dialog"
              aria-modal="false"
              aria-label="About Me social media"
            >
              <button className="about-social-panel__close" type="button" aria-label="Close About Me" onClick={() => setAboutOpen(false)}>
                <span aria-hidden="true" />
              </button>
              <div className="about-social-panel__qr" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>QR PLACEHOLDER</p>
              <strong>ABOUT ME</strong>
            </div>
          </div>
          <TubeTextScroll />
        </div>

        <section className="photo-gallery-scene" ref={galleryRef}>
          <div className="photo-gallery-bg" aria-hidden="true" />
          <h2 className="photo-gallery-title" aria-label="My work">
            <span>MY</span>
            <span>WORK</span>
          </h2>
          <div className="photo-gallery">
            {galleryPhotos.map((photo, index) => (
              <figure
                className={`photo-card is-${photo.orientation}${featuredPhotoIds.has(photo.id) ? " is-featured" : ""}${widePhotoIds.has(photo.id) ? " is-wide" : ""}`}
                key={photo.src}
                data-depth={photo.layout.depth}
                data-shift={photo.layout.shift}
                style={
                  {
                    "--card-column": photo.layout.gridColumn,
                    "--card-offset": `${photo.layout.offset}vh`,
                    "--card-width": `${photo.layout.width}%`,
                    "--card-shift": `${photo.layout.shift}%`,
                    "--card-z": photo.layout.zIndex,
                    "--card-tilt": `${photo.layout.tilt}deg`,
                    "--photo-opacity": "1",
                    "--photo-delay": `${Math.min(index, 12) * 42}ms`,
                    "--photo-ratio": photo.ratio,
                  } as CSSProperties
                }
                data-tilt={photo.layout.tilt}
              >
                <div className="photo-card-media">
                  <img src={photo.src} alt={photo.title} loading={index < 3 ? "eager" : "lazy"} decoding="async" />
                  <span className="photo-card-scan" aria-hidden="true" />
                </div>
                <figcaption>
                  <em>{photo.city}</em>
                  <span>{String(photo.id).padStart(2, "0")} / PHOTO</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <footer id="contact" className="photo-footer" aria-hidden="true" />
      </div>
    </main>
  );
}
