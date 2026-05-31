"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import photos from "@/data/portfolio-photos.json";
import { TubeTextScroll } from "@/components/tube-text-scroll";

type PortfolioPhoto = {
  id: number;
  title: string;
  originalName: string;
  src: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "square";
  ratio: number;
};

const portfolioPhotos = photos as PortfolioPhoto[];

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
  const galleryRef = useRef<HTMLElement>(null);
  const heroPhotos = useMemo(() => portfolioPhotos.slice(0, 4), []);
  const galleryPhotos = useMemo(() => {
    const nextPhotos = [...portfolioPhotos];
    const firstIndex = nextPhotos.findIndex((photo) => photo.id === 36);
    const secondIndex = nextPhotos.findIndex((photo) => photo.id === 39);

    if (firstIndex >= 0 && secondIndex >= 0) {
      [nextPhotos[firstIndex], nextPhotos[secondIndex]] = [nextPhotos[secondIndex], nextPhotos[firstIndex]];
    }

    return nextPhotos;
  }, []);
  const featuredPhotoIds = useMemo(() => {
    return new Set(
      portfolioPhotos
        .filter((photo) => photo.ratio >= 2.3 && ![11, 36].includes(photo.id))
        .map((photo) => photo.id),
    );
  }, []);
  const widePhotoIds = useMemo(() => new Set([11, 12, 20, 21]), []);

  useEffect(() => {
    const section = galleryRef.current;
    if (!section) return;

    const cards = [...section.querySelectorAll<HTMLElement>(".photo-card")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight || 1;
      const sectionRect = section.getBoundingClientRect();
      const sectionTravel = sectionRect.height + viewport;
      const sectionProgress = Math.min(1, Math.max(0, (viewport - sectionRect.top) / sectionTravel));

      cards.forEach((card, index) => {
        const column = index % 3;
        const direction = column === 1 ? -1 : 1;
        const driftStrength = column === 0 ? 132 : column === 1 ? 92 : 118;
        const imageStrength = column === 1 ? 22 : 34;
        const localOffset = (index % 5) * 7;
        const drift = (sectionProgress - 0.5) * driftStrength * direction + localOffset;
        const imageDrift = (0.5 - sectionProgress) * imageStrength * direction;

        card.style.setProperty("--photo-drift", `${drift.toFixed(2)}px`);
        card.style.setProperty("--image-drift", `${imageDrift.toFixed(2)}px`);
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <main className="photo-site">
      <section id="top" className="photo-hero">
        <div className="photo-hero-media">
          <img src={portfolioPhotos[0].src} alt={portfolioPhotos[0].title} />
          <HudCorners />
        </div>
        <div className="photo-hero-title" aria-hidden="true">
          PHOTO
          <br />
          ARCHIVE
        </div>
        <div className="photo-hero-strip" aria-label="Featured photographs">
          {heroPhotos.map((photo) => (
            <img key={photo.id} src={photo.src} alt={photo.title} />
          ))}
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
              style={
                {
                  "--photo-drift": "0px",
                  "--image-drift": "0px",
                  "--photo-delay": `${Math.min(index, 12) * 42}ms`,
                  "--photo-ratio": photo.ratio,
                  "--photo-stagger": `${[-18, 22, -6, 34, 4, 26][index % 6]}px`,
                } as CSSProperties
              }
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
                <span>{String(photo.id).padStart(2, "0")}</span>
                <strong>{photo.originalName.replace(/\.jpg$/i, "")}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <footer id="contact" className="photo-footer" aria-hidden="true" />
    </main>
  );
}
