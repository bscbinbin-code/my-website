"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import type { WorkItem } from "@/types/kookie";

const workItems: WorkItem[] = [
  {
    title: "ZARA MAN",
    tags: ["PRODUCTION"],
    image: "/kookie/assets/05-695b88c20067a74e4632e92b_Screenshot-2026-01-05-at-10.42.22-p-1600.jpg",
    video: "/kookie/assets/work-videos/01-K25039_ZARA_MAN_THUMB.mp4",
    href: "https://www.kookie-kollective.com/work/zara-man-ski-collection",
  },
  {
    title: "ZARA",
    tags: ["PRODUCTION"],
    image: "/kookie/assets/06-683d792edd768d47261a9f33_image-landscape-2afe5b54-0136-4bac-8b69-237f5d28843a-default_0.avif",
    href: "https://www.kookie-kollective.com/work/zara",
  },
  {
    title: "VITALPIN",
    tags: ["PRODUCTION", "FILM"],
    image: "/kookie/assets/07-684577a8c62c8bf8af431f0d_Frame-315-p-1600.jpg",
    video: "/kookie/assets/work-videos/02-K24036_VTALPIN_THUMB_A.mp4",
    href: "https://www.kookie-kollective.com/work/vitalpin",
  },
  {
    title: "TQ HPR40",
    tags: ["PRODUCTION", "PHOTO", "CGI/VFX", "FILM"],
    image: "/kookie/assets/08-6845765f5b87bb94b74e7965_Frame-313.jpg",
    video: "/kookie/assets/work-videos/03-K25008_TQ40_THUMB_B.mp4",
    href: "https://www.kookie-kollective.com/work/tq-hpr40",
  },
  {
    title: "GURGL",
    tags: ["PRODUCTION", "PHOTO", "CGI/VFX", "FILM"],
    image: "/kookie/assets/09-6845a8f1cb21f012cb56598d_Frame-316-p-1600.jpg",
    video: "/kookie/assets/work-videos/04-K24041_GURGL_WINTER_THUMB.mp4",
    href: "https://www.kookie-kollective.com/work/gurgl-winter-26",
  },
  {
    title: "BROOKS",
    tags: ["CGI/VFX"],
    image: "/kookie/assets/15-695be9141e1d772cab94bf1a_brooks_Grid-Image_image_001-p-1600.jpg",
    video: "/kookie/assets/work-videos/09-K25025_BROOKS_THUMB.mp4",
    href: "https://www.kookie-kollective.com/work/brooks",
  },
  {
    title: "POLESTAR",
    tags: ["PRODUCTION", "PHOTO", "CGI/VFX", "FILM"],
    image: "/kookie/assets/16-68403c78c1c739bb9cf0c147_Screenshot-2025-06-04-at-14.28.57.png",
    video: "/kookie/assets/work-videos/10-K230416_POLESTAR_THUMB_A.mp4",
    href: "https://www.kookie-kollective.com/work/polestar",
  },
  {
    title: "AK TIROL",
    tags: ["PRODUCTION", "PHOTO", "FILM"],
    image: "/kookie/assets/22-695bedef58635be72ed9c97d_ak-tirol_Main-Image_image_001-p-1600.jpg",
    video: "/kookie/assets/work-videos/16-K24028_AK_THUMB_A.mp4",
    href: "https://www.kookie-kollective.com/work/ak-tirol",
  },
  {
    title: "TENWAYS",
    tags: ["PRODUCTION", "PHOTO"],
    image: "/kookie/assets/24-6926e414cf27d75e577bca63_Frame-321-p-1600.jpg",
    href: "https://www.kookie-kollective.com/work/tenways",
  },
];

export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = [...section.querySelectorAll<HTMLElement>(".work-card")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const travel = rect.height + viewport;
      const progress = Math.min(1, Math.max(0, (viewport - rect.top) / travel));

      cards.forEach((card, index) => {
        const column = index % 3;
        const direction = column === 1 ? -1 : 1;
        const strength = column === 1 ? 78 : column === 0 ? 118 : 96;
        const stagger = (index % 4) * 8;
        const y = (progress - 0.5) * strength * direction + stagger;
        const mediaY = (0.5 - progress) * (column === 1 ? 18 : 26) * direction;
        card.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
        card.style.setProperty("--media-y", `${mediaY.toFixed(2)}px`);
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
    <section id="work" className="work-section" ref={sectionRef}>
      <div className="work-heading">
        <img src="/kookie/assets/03-684bf178cf23d64f11ff045c_work-blur-p-1600.png" alt="A half blurred title which says our work" />
      </div>
      <div className="work-grid">
        {workItems.map((item, index) => (
          <a
            className="work-card"
            href={item.href}
            key={item.title}
            style={
              {
                "--offset": `${(index % 3) * 34}px`,
                "--stagger": `${Math.min(index, 8) * 55}ms`,
                "--parallax-y": "0px",
                "--media-y": "0px",
              } as CSSProperties
            }
          >
            <span className="work-media">
              <img src={item.image} alt={item.title} />
              {item.video ? (
                <video
                  src={item.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`${item.title} motion preview`}
                />
              ) : null}
              <span className="work-media-scan" aria-hidden="true" />
            </span>
            <div className="work-meta">
              <h3>{item.title}</h3>
              <p>{item.tags.join(" / ")}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
