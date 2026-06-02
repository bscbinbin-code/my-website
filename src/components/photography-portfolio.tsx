"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
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
    x: number;
    y: number;
    width: number;
    depth: number;
    tilt: number;
  };
};

const portfolioPhotos = photos as PortfolioPhoto[];

const layoutBands = [
  [
    { x: 7, y: 0, depth: 1.1, tilt: -0.8 },
    { x: 48, y: 24, depth: 0.9, tilt: 0.7 },
    { x: 21, y: 62, depth: 1.22, tilt: -0.35 },
    { x: 63, y: 94, depth: 1.02, tilt: 0.55 },
  ],
  [
    { x: 16, y: 0, depth: 0.96, tilt: 0.65 },
    { x: 52, y: 28, depth: 1.18, tilt: -0.9 },
    { x: 6, y: 64, depth: 1.04, tilt: 0.5 },
    { x: 36, y: 96, depth: 1.16, tilt: -0.45 },
  ],
  [
    { x: 42, y: 0, depth: 1.16, tilt: 0.45 },
    { x: 8, y: 28, depth: 0.92, tilt: -0.75 },
    { x: 56, y: 64, depth: 1.08, tilt: 0.9 },
    { x: 24, y: 96, depth: 1.2, tilt: -0.5 },
  ],
  [
    { x: 10, y: 0, depth: 1.22, tilt: -0.55 },
    { x: 52, y: 26, depth: 0.98, tilt: 0.85 },
    { x: 28, y: 66, depth: 1.12, tilt: -0.65 },
    { x: 61, y: 98, depth: 0.94, tilt: 0.5 },
  ],
] as const;

const layoutBandHeight = 116;

function getCardWidth(photo: PortfolioPhoto, slotIndex: number) {
  if (photo.ratio >= 2.3) return slotIndex === 0 ? 68 : 61;
  if (photo.ratio >= 1.75) return slotIndex === 1 ? 58 : 53;
  if (photo.orientation === "landscape") return slotIndex === 2 ? 50 : 45;
  if (photo.orientation === "square") return 40;
  return photo.ratio < 0.7 ? 32 : 35;
}

function clampCardX(x: number, width: number) {
  return Math.min(Math.max(x, 5), Math.max(5, 95 - width));
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

export function PhotographyPortfolio() {
  const introRef = useRef<HTMLDivElement>(null);
  const introWordRef = useRef<SVGTextElement>(null);
  const introOutlineRef = useRef<SVGTextElement>(null);
  const introMaskRef = useRef<SVGRectElement>(null);
  const introMaskTextRef = useRef<SVGTextElement>(null);
  const siteContentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const galleryPhotos = useMemo<GalleryItem[]>(() => {
    const nextPhotos = [...portfolioPhotos];
    const firstIndex = nextPhotos.findIndex((photo) => photo.id === 36);
    const secondIndex = nextPhotos.findIndex((photo) => photo.id === 39);

    if (firstIndex >= 0 && secondIndex >= 0) {
      [nextPhotos[firstIndex], nextPhotos[secondIndex]] = [nextPhotos[secondIndex], nextPhotos[firstIndex]];
    }

    return nextPhotos.map((photo, index) => {
      const band = layoutBands[Math.floor(index / 4) % layoutBands.length];
      const slotIndex = index % 4;
      const slot = band[slotIndex];
      const row = Math.floor(index / 4);
      const width = getCardWidth(photo, slotIndex);
      const wideNudge = photo.ratio >= 2.3 ? -4 : 0;

      return {
        ...photo,
        layout: {
          x: clampCardX(slot.x + wideNudge, width),
          y: slot.y + row * layoutBandHeight,
          width,
          depth: slot.depth,
          tilt: slot.tilt,
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
          gsap.set(intro, { autoAlpha: 0, pointerEvents: "none" });
          return;
        }

        document.body.style.overflow = "hidden";
        gsap.set(siteContent, { autoAlpha: 1, visibility: "visible" });
        gsap.set(intro, { autoAlpha: 1, pointerEvents: "auto" });
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
            gsap.set(intro, { pointerEvents: "none" });
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

        mm.add(
          {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            desktop: "(min-width: 901px)",
          },
          (context) => {
            const { reduceMotion, desktop } = context.conditions ?? {};

            if (reduceMotion) {
              gsap.set(cards, { autoAlpha: 1, clearProps: "transform" });
              return;
            }

            cards.forEach((card, index) => {
              const caption = card.querySelector<HTMLElement>("figcaption");
              const captionText = caption?.querySelector<HTMLElement>("em");
              const depth = Number(card.dataset.depth || 1);
              const direction = index % 2 === 0 ? -1 : 1;
              const lane = index % 4;
              const driftX = desktop ? 46 : 14;
              const enterY = desktop ? 160 : 96;
              const leaveY = desktop ? -220 : -150;
              const baseRotation = Number(card.dataset.tilt || 0);

              const cardTimeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: card,
                  start: "top 92%",
                  end: "bottom 8%",
                  scrub: 1.25 + depth * 0.22,
                  invalidateOnRefresh: true,
                },
              });

              cardTimeline.fromTo(
                card,
                {
                  autoAlpha: 0.72,
                  x: () => direction * driftX * depth,
                  y: () => enterY * depth + lane * 9,
                  scale: 0.93,
                  rotation: baseRotation - direction * 0.8,
                  transformOrigin: "50% 50%",
                },
                {
                  autoAlpha: 1,
                  x: () => direction * -driftX * depth,
                  y: () => leaveY * depth - lane * 7,
                  scale: 1.025,
                  rotation: baseRotation + direction * 0.7,
                  duration: 1,
                },
                0,
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
            <img src={portfolioPhotos[0].src} alt={portfolioPhotos[0].title} />
            <HudCorners />
          </div>
          <div className="photo-hero-title" aria-hidden="true">
            <span>B</span>
            <span>I</span>
            <span>N</span>
          </div>
        </section>

        <div id="locations">
          <TubeTextScroll />
        </div>

        <section className="photo-gallery-scene" ref={galleryRef}>
          <div className="photo-gallery-bg" aria-hidden="true" />
          <div className="photo-gallery">
            {galleryPhotos.map((photo, index) => (
              <figure
                className={`photo-card is-${photo.orientation}${featuredPhotoIds.has(photo.id) ? " is-featured" : ""}${widePhotoIds.has(photo.id) ? " is-wide" : ""}`}
                key={photo.src}
                data-depth={photo.layout.depth}
                style={
                  {
                    "--card-left": `${photo.layout.x}%`,
                    "--card-top": `${photo.layout.y}vh`,
                    "--card-width": `${photo.layout.width}vw`,
                    "--card-tilt": `${photo.layout.tilt}deg`,
                    "--photo-opacity": "1",
                    "--photo-delay": `${Math.min(index, 12) * 42}ms`,
                    "--photo-ratio": photo.ratio,
                  } as CSSProperties
                }
                data-tilt={photo.layout.tilt}
              >
                <div className="photo-card-media">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading={index < 6 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="photo-card-scan" aria-hidden="true" />
                </div>
                <figcaption>
                  <em>{photo.city}</em>
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
