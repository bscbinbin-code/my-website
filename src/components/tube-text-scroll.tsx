"use client";

import { useEffect, useMemo, useRef } from "react";

const cityNames = ["广州", "厦门", "温州", "北海"];

export function TubeTextScroll() {
  const wrapperRef = useRef<HTMLElement>(null);
  const textWrapperRef = useRef<HTMLUListElement>(null);
  const items = useMemo(() => [...cityNames, ...cityNames, ...cityNames], []);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    const init = async () => {
      const wrapper = wrapperRef.current;
      const textWrapper = textWrapperRef.current;
      if (!wrapper || !textWrapper) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const textItems = [...textWrapper.querySelectorAll<HTMLElement>(".photo-tube-item")];
      const setPositions = () => {
        const baseSize = Math.min(window.innerWidth, window.innerHeight);
        const radius = baseSize * 0.4;
        const spacing = 360 / textItems.length;

        textItems.forEach((item, index) => {
          const angle = (index * spacing * Math.PI) / 180;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          const rotationY = index * spacing;

          item.style.transform = `translate3d(${x}px, -50%, ${z}px) rotateY(${rotationY}deg)`;
        });
      };

      setPositions();

      const trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const rotation = self.progress * 360;
          textWrapper.style.transform = `rotateZ(15deg) rotateY(${rotation}deg)`;
        },
      });

      window.addEventListener("resize", setPositions);

      cleanup = () => {
        trigger.kill();
        window.removeEventListener("resize", setPositions);
      };
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section className="photo-tube-section" ref={wrapperRef} aria-label="城市滚动文字动画">
      <ul className="photo-tube-text" ref={textWrapperRef}>
        {items.map((city, index) => (
          <li className="photo-tube-item" key={`${city}-${index}`}>
            {city}
          </li>
        ))}
      </ul>
    </section>
  );
}
