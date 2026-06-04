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

type PhotoCoordinates = {
  latitude: number;
  longitude: number;
};

const portfolioPhotos = photos as PortfolioPhoto[];
const fallbackPalette = ["#d8d8d2", "#8f9795", "#242827"];

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

function getPhotoCoordinates(photo: PortfolioPhoto): PhotoCoordinates | null {
  const coordinateText = `${photo.originalName} ${photo.src}`;
  const coordinatePair = coordinateText.match(/(-?\d{1,3}\.\d+)\s*[,，]\s*(-?\d{1,3}\.\d+)/);

  if (coordinatePair?.[1] && coordinatePair[2]) {
    return {
      latitude: Number.parseFloat(coordinatePair[1]),
      longitude: Number.parseFloat(coordinatePair[2]),
    };
  }

  const numbers = [...coordinateText.matchAll(/-?\d{1,3}\.\d+/g)].map(([value]) => Number.parseFloat(value));
  const latitude = numbers.find((value) => value >= -90 && value <= 90);
  const longitude = numbers.find((value) => value >= -180 && value <= 180 && value !== latitude);

  if (latitude === undefined || longitude === undefined) return null;

  return { latitude, longitude };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const photoCoordinateBounds = portfolioPhotos.reduce(
  (bounds, photo) => {
    const coordinates = getPhotoCoordinates(photo);
    if (!coordinates) return bounds;

    return {
      minLatitude: Math.min(bounds.minLatitude, coordinates.latitude),
      maxLatitude: Math.max(bounds.maxLatitude, coordinates.latitude),
      minLongitude: Math.min(bounds.minLongitude, coordinates.longitude),
      maxLongitude: Math.max(bounds.maxLongitude, coordinates.longitude),
    };
  },
  {
    minLatitude: Number.POSITIVE_INFINITY,
    maxLatitude: Number.NEGATIVE_INFINITY,
    minLongitude: Number.POSITIVE_INFINITY,
    maxLongitude: Number.NEGATIVE_INFINITY,
  },
);

function getMapPointStyle(coordinates: PhotoCoordinates): CSSProperties {
  const longitudeRange = Math.max(0.001, photoCoordinateBounds.maxLongitude - photoCoordinateBounds.minLongitude);
  const latitudeRange = Math.max(0.001, photoCoordinateBounds.maxLatitude - photoCoordinateBounds.minLatitude);
  const x = ((coordinates.longitude - photoCoordinateBounds.minLongitude) / longitudeRange) * 100;
  const y = 100 - ((coordinates.latitude - photoCoordinateBounds.minLatitude) / latitudeRange) * 100;

  return {
    "--map-point-x": `${clamp(x, 8, 92)}%`,
    "--map-point-y": `${clamp(y, 8, 92)}%`,
  } as CSSProperties;
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function getColorfulness(red: number, green: number, blue: number) {
  return Math.max(red, green, blue) - Math.min(red, green, blue);
}

function extractPaletteFromImage(src: string): Promise<string[]> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(fallbackPalette);
        return;
      }

      const sampleSize = 96;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      context.drawImage(image, 0, 0, sampleSize, sampleSize);

      const { data, width, height } = context.getImageData(0, 0, sampleSize, sampleSize);
      const buckets = new Map<string, { count: number; score: number; red: number; green: number; blue: number }>();

      for (let index = 0; index < data.length; index += 16) {
        const alpha = data[index + 3] ?? 0;
        if (alpha < 180) continue;

        const red = data[index] ?? 0;
        const green = data[index + 1] ?? 0;
        const blue = data[index + 2] ?? 0;
        const brightness = red * 0.299 + green * 0.587 + blue * 0.114;
        const colorfulness = getColorfulness(red, green, blue);
        if (brightness < 44 || brightness > 238) continue;
        if (brightness < 62 && colorfulness < 34) continue;

        const pixel = index / 4;
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        const normalizedX = Math.abs(x / (width - 1) - 0.5) * 2;
        const normalizedY = Math.abs(y / (height - 1) - 0.5) * 2;
        const centerWeight = 1 - Math.min(0.72, (normalizedX + normalizedY) * 0.34);
        const vibranceWeight = 0.82 + Math.min(0.56, colorfulness / 220);
        const brightnessWeight = brightness < 78 ? 0.55 : brightness > 218 ? 0.72 : 1;
        const weight = centerWeight * vibranceWeight * brightnessWeight;

        const key = `${Math.round(red / 32) * 32}-${Math.round(green / 32) * 32}-${Math.round(blue / 32) * 32}`;
        const bucket = buckets.get(key) ?? { count: 0, score: 0, red: 0, green: 0, blue: 0 };
        bucket.count += 1;
        bucket.score += weight;
        bucket.red += red * weight;
        bucket.green += green * weight;
        bucket.blue += blue * weight;
        buckets.set(key, bucket);
      }

      const palette = [...buckets.values()]
        .filter((bucket) => bucket.score >= 0.8)
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)
        .map((bucket) =>
          rgbToHex(
            Math.round(bucket.red / bucket.score),
            Math.round(bucket.green / bucket.score),
            Math.round(bucket.blue / bucket.score),
          ),
        );

      resolve(palette.length >= 3 ? palette : [...palette, ...fallbackPalette].slice(0, 3));
    };
    image.onerror = () => resolve(fallbackPalette);
    image.src = src;
  });
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

function PhotoLocationMap({ photo }: { photo: GalleryItem }) {
  const coordinates = getPhotoCoordinates(photo);

  if (!coordinates) return null;

  return (
    <div className="photo-detail-location-wrap">
      <button className="photo-detail-location" type="button" aria-label={`Show location for ${photo.city}`}>
        LOCATION
      </button>
      <aside className="photo-detail-map" aria-label={`${photo.city} shooting location`} style={getMapPointStyle(coordinates)}>
        <div className="photo-detail-map__grid" aria-hidden="true" />
        <span className="photo-detail-map__route photo-detail-map__route--one" aria-hidden="true" />
        <span className="photo-detail-map__route photo-detail-map__route--two" aria-hidden="true" />
        <span className="photo-detail-map__route photo-detail-map__route--three" aria-hidden="true" />
        <span className="photo-detail-map__point" aria-hidden="true" />
        <div className="photo-detail-map__meta">
          <strong>{photo.city}</strong>
          <span>
            {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </span>
        </div>
      </aside>
    </div>
  );
}

export function PhotographyPortfolio() {
  const [aboutReady, setAboutReady] = useState(false);
  const [aboutOnDark, setAboutOnDark] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [photoPalettes, setPhotoPalettes] = useState<Record<number, string[]>>({});
  const introRef = useRef<HTMLDivElement>(null);
  const introWordRef = useRef<SVGTextElement>(null);
  const introOutlineRef = useRef<SVGTextElement>(null);
  const introMaskRef = useRef<SVGRectElement>(null);
  const introMaskTextRef = useRef<SVGTextElement>(null);
  const siteContentRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const aboutAnchorRef = useRef<HTMLDivElement>(null);
  const workTransitionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const detailOverlayRef = useRef<HTMLDivElement>(null);
  const detailFrameRef = useRef<HTMLElement>(null);
  const detailOriginRef = useRef<DOMRect | null>(null);
  const detailClosingRef = useRef(false);
  const scrollLockRef = useRef<{ overflow: string; paddingRight: string } | null>(null);
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
  const selectedPhoto = useMemo(() => galleryPhotos.find((photo) => photo.id === selectedPhotoId) ?? null, [galleryPhotos, selectedPhotoId]);
  const selectedPalette = selectedPhoto ? (photoPalettes[selectedPhoto.id] ?? fallbackPalette) : fallbackPalette;

  const createDetailTransitionClone = (photo: GalleryItem, rect: DOMRect) => {
    const clone = document.createElement("div");
    const image = document.createElement("img");

    clone.className = "photo-detail-transition";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.setProperty("--detail-ratio", `${photo.ratio}`);

    image.src = photo.src;
    image.alt = "";
    image.decoding = "async";
    clone.appendChild(image);
    document.body.appendChild(clone);

    return clone;
  };

  const openPhotoDetail = (photo: GalleryItem, element: HTMLElement) => {
    if (detailClosingRef.current) return;
    detailOriginRef.current = (element.querySelector<HTMLElement>(".photo-card-media") ?? element).getBoundingClientRect();
    setSelectedPhotoId(photo.id);
  };

  const closePhotoDetail = async () => {
    if (detailClosingRef.current) return;

    const overlay = detailOverlayRef.current;
    const frame = detailFrameRef.current;
    if (!overlay || !frame) {
      setSelectedPhotoId(null);
      return;
    }

    const { gsap } = await import("gsap");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setSelectedPhotoId(null);
      return;
    }

    detailClosingRef.current = true;
    const origin = detailOriginRef.current;
    const media = frame.querySelector<HTMLElement>(".photo-detail-media");
    const frameRect = (media ?? frame).getBoundingClientRect();
    const metadata = frame.querySelectorAll<HTMLElement>(".photo-detail-meta > *");
    const clone = selectedPhoto ? createDetailTransitionClone(selectedPhoto, frameRect) : null;

    gsap.set(clone, { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
    gsap.set(frame, { autoAlpha: 0 });
    gsap
      .timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          clone?.remove();
          detailClosingRef.current = false;
          setSelectedPhotoId(null);
        },
      })
      .to(metadata, { autoAlpha: 0, y: 8, filter: "blur(5px)", duration: 0.16 }, 0)
      .to(
        clone,
        {
          left: origin ? origin.left : frameRect.left + frameRect.width * 0.38,
          top: origin ? origin.top : frameRect.top + 28,
          width: origin ? origin.width : frameRect.width * 0.24,
          height: origin ? origin.height : frameRect.height * 0.24,
          filter: "blur(3px)",
          duration: 0.54,
        },
        0,
      )
      .to(overlay, { autoAlpha: 0, duration: 0.36 }, 0.1);
  };

  useEffect(() => {
    if (!selectedPhoto || photoPalettes[selectedPhoto.id]) return;

    let cancelled = false;
    extractPaletteFromImage(selectedPhoto.src).then((palette) => {
      if (cancelled) return;
      setPhotoPalettes((current) => ({ ...current, [selectedPhoto.id]: palette }));
    });

    return () => {
      cancelled = true;
    };
  }, [photoPalettes, selectedPhoto]);

  useEffect(() => {
    if (!aboutOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAboutOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen]);

  useEffect(() => {
    if (!selectedPhoto) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") void closePhotoDetail();
    };

    if (!scrollLockRef.current) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      scrollLockRef.current = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      const previous = scrollLockRef.current;
      if (previous) {
        document.body.style.overflow = previous.overflow;
        document.body.style.paddingRight = previous.paddingRight;
        scrollLockRef.current = null;
      }
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedPhoto]);

  useEffect(() => {
    const overlay = detailOverlayRef.current;
    const frame = detailFrameRef.current;
    if (!selectedPhoto || !overlay || !frame) return;

    let cleanup = () => {};
    let cancelled = false;

    const init = async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const origin = detailOriginRef.current;
      const media = frame.querySelector<HTMLElement>(".photo-detail-media");
      const target = (media ?? frame).getBoundingClientRect();
      const metadata = frame.querySelectorAll<HTMLElement>(".photo-detail-meta > *");
      const clone = origin ? createDetailTransitionClone(selectedPhoto, origin) : null;

      const ctx = gsap.context(() => {
        if (reduceMotion) {
          gsap.set([overlay, frame, metadata], { clearProps: "all" });
          return;
        }

        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(frame, {
          autoAlpha: 0,
          x: 0,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transformOrigin: "50% 50%",
        });
        gsap.set(metadata, { autoAlpha: 0, y: 10, filter: "blur(6px)" });
        gsap.set(clone, { autoAlpha: 1, filter: "blur(0px)" });

        gsap
          .timeline({
            defaults: { ease: "power3.inOut" },
            onComplete: () => {
              clone?.remove();
            },
          })
          .to(overlay, { autoAlpha: 1, duration: 0.24 }, 0)
          .to(
            clone,
            {
              left: target.left,
              top: target.top,
              width: target.width,
              height: target.height,
              duration: 0.58,
            },
            0,
          )
          .to(
            frame,
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.18,
            },
            0.48,
          )
          .to(clone, { autoAlpha: 0, duration: 0.12 }, 0.5)
          .to(metadata, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.28, stagger: 0.035, ease: "power2.out" }, 0.52);
      }, overlay);

      cleanup = () => {
        clone?.remove();
        ctx.revert();
      };
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [selectedPhoto]);

  useEffect(() => {
    const section = locationsRef.current;
    const anchor = aboutAnchorRef.current;
    const transition = workTransitionRef.current;
    const gallery = galleryRef.current;
    if (!section || !anchor || !transition || !gallery) return;

    let frame = 0;
    const updateReady = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const transitionRect = transition.getBoundingClientRect();
      const galleryRect = gallery.getBoundingClientRect();
      const stickyTop = Number.parseFloat(window.getComputedStyle(anchor).top) || 0;
      const nextReady = rect.top <= stickyTop + 2 && galleryRect.bottom > stickyTop + 96;
      const nextOnDark = transitionRect.top <= stickyTop + window.innerHeight * 0.46;

      setAboutReady(nextReady);
      setAboutOnDark(nextOnDark);
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
    const section = workTransitionRef.current;
    if (!section) return;

    let cleanup = () => {};
    let cancelled = false;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const stage = section.querySelector<HTMLElement>(".photo-work-transition__stage");
        const hudItems = section.querySelectorAll<HTMLElement>(".photo-work-transition__hud > *");
        const dot = section.querySelector<HTMLElement>(".photo-work-transition__dot");
        const reticles = section.querySelectorAll<HTMLElement>(".photo-work-transition__reticle");

        if (!stage) return;

        if (reduceMotion) {
          gsap.set(stage, { "--work-darkness": 1, backgroundColor: "#111" });
          gsap.set([hudItems, dot, reticles], { autoAlpha: 1, filter: "blur(0px)" });
          return;
        }

        gsap.set(stage, {
          "--work-darkness": 0,
          "--work-smear": 0,
          "--work-veil": 0,
          backgroundColor: "transparent",
          color: "#101112",
        });
        gsap.set(hudItems, { autoAlpha: 0, y: -8 });
        gsap.set(dot, { autoAlpha: 0, scale: 0.6 });
        gsap.set(reticles, { autoAlpha: 0.16 });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top 76%",
              end: "top -34%",
              scrub: 1.08,
              invalidateOnRefresh: true,
              refreshPriority: -2,
            },
          })
          .to(stage, { "--work-veil": 1, duration: 0.2 }, 0)
          .to(stage, { "--work-smear": 1, duration: 0.46 }, 0.04)
          .to(stage, { "--work-darkness": 1, duration: 0.44 }, 0.08)
          .to(stage, { backgroundColor: "#111", color: "#f2f2ee", duration: 0.24 }, 0.22)
          .to(hudItems, { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.035 }, 0.24)
          .to(dot, { autoAlpha: 1, scale: 1, duration: 0.18 }, 0.36)
          .to(reticles, { autoAlpha: 0.5, duration: 0.3, stagger: 0.04 }, 0.34);

        ScrollTrigger.refresh();
      }, section);

      cleanup = () => ctx.revert();
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
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
              const enterY = desktop ? 26 : 18;
              const leaveY = desktop ? -24 : -16;
              const baseRotation = Number(card.dataset.tilt || 0);

              const cardTimeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: card,
                  start: "top 112%",
                  end: "bottom 34%",
                  scrub: 1.05 + depth * 0.18,
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

      <div className="about-float-anchor" ref={aboutAnchorRef}>
        <button
          className={`about-float${aboutReady ? " is-visible" : ""}${aboutOpen ? " is-open" : ""}${aboutOnDark ? " is-on-dark" : ""}`}
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
          <TubeTextScroll />
        </div>

        <section className="photo-work-transition" ref={workTransitionRef} aria-hidden="true">
          <div className="photo-work-transition__stage">
            <div className="photo-work-transition__hud">
              <span>003</span>
              <i />
              <strong>WORK</strong>
              <b>BIN +</b>
            </div>
            <span className="photo-work-transition__dot" />
            <span className="photo-work-transition__reticle photo-work-transition__reticle--one" />
            <span className="photo-work-transition__reticle photo-work-transition__reticle--two" />
            <span className="photo-work-transition__cross photo-work-transition__cross--one" />
            <span className="photo-work-transition__cross photo-work-transition__cross--two" />
          </div>
        </section>

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
                role="button"
                tabIndex={0}
                aria-label={`Open ${photo.city} photo`}
                onClick={(event) => openPhotoDetail(photo, event.currentTarget)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPhotoDetail(photo, event.currentTarget);
                  }
                }}
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
      {selectedPhoto ? (
        <div
          className="photo-detail-overlay"
          ref={detailOverlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedPhoto.city} photo detail`}
          onClick={() => void closePhotoDetail()}
        >
          <button className="photo-detail-close" type="button" aria-label="Close photo detail" onClick={() => void closePhotoDetail()}>
            <span aria-hidden="true" />
          </button>
          <figure
            className="photo-detail-frame"
            ref={detailFrameRef}
            style={{ "--detail-ratio": selectedPhoto.ratio } as CSSProperties}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="photo-detail-media">
              <img src={selectedPhoto.src} alt={selectedPhoto.title} decoding="async" />
            </div>
            <figcaption className="photo-detail-meta">
              <strong>{selectedPhoto.city}</strong>
              <div className="photo-detail-palette" aria-label="Main photo colors">
                {selectedPalette.map((color) => (
                  <span className="photo-detail-swatch" key={color} style={{ "--swatch-color": color } as CSSProperties}>
                    <i aria-hidden="true" />
                    <b>{color.toUpperCase()}</b>
                  </span>
                ))}
              </div>
              <PhotoLocationMap photo={selectedPhoto} />
            </figcaption>
          </figure>
        </div>
      ) : null}
    </main>
  );
}
