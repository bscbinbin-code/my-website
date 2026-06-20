"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import photos from "@/data/more-photos.json";
import styles from "./more-photo-field.module.css";

type MorePhoto = {
  id: number;
  title: string;
  originalName: string;
  src: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "square";
  ratio: number;
};

type TrackPhoto = MorePhoto & {
  route: number;
  rotation: number;
  depth: number;
  widthVw: number;
  maxWidth: number;
  laneShift: number;
  waveX: number;
  waveY: number;
  wavePhase: number;
};

const morePhotos = photos as MorePhoto[];
const activeGroupSize = 4;
const introStackSize = 12;
const introHoldSize = 2;
const routeCount = 5;
const trackSegment = 1180;
const trackSlotSpacing = trackSegment / activeGroupSize;
const trackFadeDistance = 72;
const initialTrackProgress = trackSlotSpacing * (introHoldSize - 0.5);
const reverseProgressLimit = trackSlotSpacing * 0.12;
const reverseHoldMs = 260;
const introLeadPhotoIds = [3, 8];

const orderedMorePhotos = [
  ...introLeadPhotoIds
    .map((id) => morePhotos.find((photo) => photo.id === id))
    .filter((photo): photo is MorePhoto => Boolean(photo)),
  ...morePhotos.filter((photo) => !introLeadPhotoIds.includes(photo.id)),
];

function wrapValue(value: number, min: number, max: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function getTrackPhotos(): TrackPhoto[] {
  return orderedMorePhotos.map((photo, index) => {
    const route = index % routeCount;
    const isHero = index === 0 || index === 1 || index % 17 === 0;
    const isPortrait = photo.orientation === "portrait";
    const widthVw = isHero ? 45 : isPortrait ? 25 + (index % 4) * 1.35 : 34 + (index % 5) * 1.65;
    const maxWidth = isHero ? 980 : isPortrait ? 620 : 880;

    return {
      ...photo,
      route,
      rotation: 0,
      depth: 20 + ((index * 7) % 60),
      widthVw,
      maxWidth,
      laneShift: ((index * 41) % 126) - 63,
      waveX: 4 + (index % 4) * 3,
      waveY: 4 + (index % 5) * 3,
      wavePhase: index * 0.71,
    };
  });
}

export function MorePhotoField() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackPhotos = useMemo(() => getTrackPhotos(), []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return undefined;

    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".more-photo-card"));
    let cardMetrics = cards.map(() => ({ width: 0, height: 0 }));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = {
      isTracking: false,
      progress: initialTrackProgress,
      velocity: 0,
      reverseHoldUntil: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const loopLength = Math.max(trackSegment + trackSlotSpacing, trackPhotos.length * trackSlotSpacing);

    const measureCards = () => {
      cardMetrics = cards.map((card) => ({
        width: card.offsetWidth,
        height: card.offsetHeight,
      }));
    };

    const setDimensions = () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      measureCards();
    };

    const getIntroStackPosition = (item: TrackPhoto, index: number) => {
      const width = state.width;
      const height = state.height;
      const stackOffsets = [
        { x: 0, y: 0, scale: 1.24 },
        { x: -width * 0.032, y: height * 0.008, scale: 1.18 },
        { x: width * 0.034, y: -height * 0.008, scale: 1.18 },
        { x: -width * 0.07, y: -height * 0.014, scale: 1.12 },
        { x: width * 0.072, y: height * 0.014, scale: 1.12 },
        { x: -width * 0.104, y: height * 0.024, scale: 1.05 },
        { x: width * 0.106, y: -height * 0.024, scale: 1.05 },
        { x: -width * 0.018, y: -height * 0.052, scale: 1.08 },
        { x: width * 0.018, y: height * 0.052, scale: 1.08 },
        { x: -width * 0.132, y: height * 0.002, scale: 0.98 },
        { x: width * 0.132, y: height * 0.01, scale: 0.98 },
        { x: 0, y: height * 0.072, scale: 0.96 },
      ];
      const position = stackOffsets[index % stackOffsets.length] ?? stackOffsets[0];

      return {
        x: position.x + ((index * 17) % 18) - 9,
        y: position.y + ((index * 23) % 16) - 8,
        scale: position.scale,
        rotation: item.rotation,
      };
    };

    const getIntroExitPosition = (item: TrackPhoto, index: number) => {
      const width = state.width;
      const height = state.height;

      const positions = [
        { x: -width * 1.0, y: -height * 0.64, scale: 0.76 },
        { x: width * 1.04, y: -height * 0.56, scale: 0.74 },
        { x: -width * 1.02, y: height * 0.56, scale: 0.78 },
        { x: width * 1.06, y: height * 0.58, scale: 0.72 },
        { x: -width * 0.24, y: -height * 0.92, scale: 0.7 },
        { x: width * 0.28, y: height * 0.9, scale: 0.72 },
        { x: -width * 1.18, y: -height * 0.02, scale: 0.68 },
        { x: width * 1.2, y: height * 0.04, scale: 0.68 },
        { x: -width * 0.42, y: height * 0.96, scale: 0.66 },
        { x: width * 0.48, y: -height * 0.88, scale: 0.66 },
      ];
      const slot = (index - introHoldSize) % positions.length;
      const position = positions[slot] ?? positions[0];

      return {
        x: position.x + ((index * 19) % 42) - 21,
        y: position.y + ((index * 31) % 40) - 20,
        scale: position.scale,
        rotation: item.rotation,
      };
    };

    const getPhotoLocalProgress = (index: number, progress: number) => {
      const rawProgress = progress - index * trackSlotSpacing;

      if (progress < loopLength - trackFadeDistance && rawProgress < -trackFadeDistance) {
        return rawProgress;
      }

      return wrapValue(rawProgress, -trackFadeDistance, loopLength - trackFadeDistance);
    };

    const getTrackAlpha = (localProgress: number) => {
      if (localProgress < -trackFadeDistance || localProgress > trackSegment + trackFadeDistance) {
        return 0;
      }

      return 1;
    };

    const getTrackPosition = (item: TrackPhoto, localProgress: number, progress: number) => {
      const width = state.width;
      const height = state.height;
      const normalized = localProgress / trackSegment;
      const waveX = Math.sin(progress * 0.006 + item.wavePhase) * item.waveX;
      const waveY = Math.cos(progress * 0.004 + item.wavePhase) * item.waveY;
      const lane = item.laneShift;

      switch (item.route) {
        case 0:
          return {
            x: -width * 0.78 + normalized * width * 1.62 + waveX,
            y: -height * 0.22 + lane * 0.16 + waveY,
          };
        case 1:
          return {
            x: width * 0.76 - normalized * width * 1.58 + waveX,
            y: height * 0.06 + lane * 0.22 + waveY,
          };
        case 2:
          return {
            x: -width * 0.18 + lane * 0.42 + normalized * width * 0.26 + waveX,
            y: -height * 0.7 + normalized * height * 1.42 + waveY,
          };
        case 3:
          return {
            x: -width * 0.46 + normalized * width * 0.98 + waveX,
            y: height * 0.2 - normalized * height * 0.54 + lane * 0.08 + waveY,
          };
        default:
          return {
            x: width * 0.72 - normalized * width * 1.44 + waveX,
            y: height * 0.56 - normalized * height * 1.04 + lane * 0.12 + waveY,
          };
      }
    };

    const isTrackCardNearViewport = (index: number, position: { x: number; y: number }, scale = 1) => {
      const metrics = cardMetrics[index] ?? { width: 0, height: 0 };
      const cardWidth = metrics.width * scale;
      const cardHeight = metrics.height * scale;
      const centerX = state.width / 2 + position.x;
      const centerY = state.height / 2 + position.y;
      const margin = Math.max(180, Math.min(state.width, state.height) * 0.18);

      return (
        centerX + cardWidth / 2 > -margin &&
        centerX - cardWidth / 2 < state.width + margin &&
        centerY + cardHeight / 2 > -margin &&
        centerY - cardHeight / 2 < state.height + margin
      );
    };

    const getIntroReleasePosition = (item: TrackPhoto, index: number) => {
      if (index < introHoldSize) {
        const localProgress = getPhotoLocalProgress(index, initialTrackProgress);
        const position = getTrackPosition(item, localProgress, initialTrackProgress);

        return {
          ...position,
          scale: 1,
          rotation: item.rotation,
        };
      }

      return getIntroExitPosition(item, index);
    };

    const renderTrack = () => {
      cards.forEach((card, index) => {
        const item = trackPhotos[index];
        if (!item) return;

        const localProgress = getPhotoLocalProgress(index, state.progress);
        const position = getTrackPosition(item, localProgress, state.progress);

        if (!isTrackCardNearViewport(index, position)) {
          gsap.set(card, { autoAlpha: 0 });
          return;
        }

        gsap.set(card, {
          autoAlpha: 1,
          scale: 1,
          x: position.x,
          y: position.y,
          rotation: 0,
        });
      });
    };

    const tick = () => {
      if (!state.isTracking) return;
      const delta = gsap.ticker.deltaRatio(60);
      const isHoldingReverseLimit = state.progress <= reverseProgressLimit && performance.now() < state.reverseHoldUntil;
      if (isHoldingReverseLimit) {
        state.progress = reverseProgressLimit;
        state.velocity = 0;
        renderTrack();
        return;
      }

      state.progress += (0.44 + state.velocity) * delta;
      if (state.progress < reverseProgressLimit) {
        state.progress = reverseProgressLimit;
        state.velocity = 0;
        state.reverseHoldUntil = performance.now() + reverseHoldMs;
      }
      state.velocity *= Math.pow(0.91, delta);
      if (Math.abs(state.velocity) < 0.002) state.velocity = 0;
      renderTrack();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY < 0 && state.progress <= reverseProgressLimit) {
        state.progress = reverseProgressLimit;
        state.velocity = 0;
        state.reverseHoldUntil = performance.now() + reverseHoldMs;
        return;
      }

      const nextVelocity = state.velocity + event.deltaY * 0.018;
      state.velocity = gsap.utils.clamp(-24, 32, nextVelocity);
    };

    const ctx = gsap.context(() => {
      gsap.set(cards, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        autoAlpha: 0,
        scale: 0.34,
        rotation: 0,
        transformOrigin: "50% 50%",
      });
      measureCards();

      cards.forEach((card, index) => {
        gsap.set(card, { zIndex: 20 + index });
      });

      if (reduceMotion) {
        gsap.set(root.querySelector(".more-photo-loader"), { autoAlpha: 0, display: "none" });
        cards.forEach((card, index) => {
          const item = trackPhotos[index];
          if (!item) return;
          const localProgress = getPhotoLocalProgress(index, initialTrackProgress);
          const alpha = getTrackAlpha(localProgress);
          const position = getTrackPosition(item, localProgress, initialTrackProgress);
          gsap.set(card, {
            autoAlpha: alpha,
            scale: 1,
            x: position.x,
            y: position.y,
            rotation: 0,
          });
        });
        return;
      }

      const introCards = cards.slice(0, introStackSize);
      const retiringIntroCards = introCards.slice(introHoldSize);

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          state.isTracking = true;
          renderTrack();
        },
      });

      timeline
        .fromTo(
          ".more-photo-loader__mark",
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0,
        )
        .fromTo(
          ".more-photo-loader__line",
          { scaleX: 0, transformOrigin: "50% 50%" },
          { scaleX: 1, duration: 0.58, ease: "power2.inOut" },
          0.08,
        )
        .fromTo(
          introCards,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 0.82,
            rotation: 0,
          },
          {
            autoAlpha: 1,
            immediateRender: false,
            x: (index) => {
              const item = trackPhotos[index];
              return item ? getIntroStackPosition(item, index).x : 0;
            },
            y: (index) => {
              const item = trackPhotos[index];
              return item ? getIntroStackPosition(item, index).y : 0;
            },
            scale: (index) => {
              const item = trackPhotos[index];
              return item ? getIntroStackPosition(item, index).scale : 0.62;
            },
            rotation: 0,
            duration: 0.54,
            stagger: {
              each: 0.024,
              from: "center",
            },
            ease: "back.out(1.28)",
          },
          0.24,
        )
        .to(
          ".more-photo-loader",
          {
            autoAlpha: 0,
            duration: 0.08,
            ease: "power2.out",
          },
          0.16,
        )
        .set(
          ".more-photo-loader",
          {
            display: "none",
          },
          0.22,
        )
        .to(
          introCards,
          {
            x: (index) => {
              const item = trackPhotos[index];
              return item ? getIntroReleasePosition(item, index).x : 0;
            },
            y: (index) => {
              const item = trackPhotos[index];
              return item ? getIntroReleasePosition(item, index).y : 0;
            },
            scale: (index) => {
              const item = trackPhotos[index];
              return item ? getIntroReleasePosition(item, index).scale : 0.88;
            },
            rotation: 0,
            duration: 0.82,
            stagger: 0.018,
            ease: "power2.inOut",
          },
          0.86,
        )
        .set(
          retiringIntroCards,
          {
            autoAlpha: 0,
          },
          1.9,
        );
    }, root);

    gsap.ticker.add(tick);
    window.addEventListener("resize", setDimensions);
    root.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", setDimensions);
      gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, [trackPhotos]);

  return (
    <section className={`${styles.scope} more-photo-field`} ref={rootRef} aria-label="More BIN photo preview">
      <div className="more-photo-loader" aria-hidden="true">
        <span className="more-photo-loader__mark">BIN</span>
        <span className="more-photo-loader__line" />
      </div>

      <div className="more-photo-stage" ref={stageRef} aria-hidden="true">
        {trackPhotos.map((photo, index) => (
          <figure
            className={`more-photo-card is-${photo.orientation}`}
            key={photo.src}
            style={
              {
                "--more-card-width": `${photo.widthVw}vw`,
                "--more-card-max": `${photo.maxWidth}px`,
                "--more-card-ratio": `${photo.width} / ${photo.height}`,
                "--more-card-ratio-value": photo.ratio,
                "--more-card-depth": photo.depth,
              } as CSSProperties
            }
          >
            <Image
              src={photo.src}
              alt=""
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 760px) 82vw, 48vw"
              priority={index < introStackSize}
              unoptimized
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
