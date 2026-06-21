"use client";

import { useEffect, useRef } from "react";

const cityNames = [
  { en: "GUANGZHOU", zh: "广州" },
  { en: "WENZHOU", zh: "温州" },
  { en: "XIAMEN", zh: "厦门" },
  { en: "BEIHAI", zh: "北海" },
];
const clearTextFilter = "blur(0px) contrast(1)";
const meltTextFilter = "url(#photo-tube-melt) blur(30px) contrast(1.85)";
const clearGlowFilter = "blur(18px) contrast(1.25) saturate(1.35)";
const meltGlowFilter = "url(#photo-tube-melt) blur(30px) contrast(1.55) saturate(1.42)";
const clearShadow =
  "0 0 1px rgb(8 9 10 / 0.36), 0 0 22px rgb(118 16 36 / 0.78), 0 0 56px rgb(242 48 84 / 0.56)";
const meltShadow =
  "0 0 22px rgb(8 9 10 / 0.98), 0 0 72px rgb(118 16 36 / 1), 0 0 150px rgb(242 48 84 / 0.94)";

type LetterNode = {
  char: string;
  glow: HTMLSpanElement;
  text: HTMLSpanElement;
};

function getLetterAdvance(char: string, fontSize: number) {
  const wideLetters = new Set(["M", "W"]);
  const narrowLetters = new Set(["I"]);
  const semiWideLetters = new Set(["G", "O", "Q", "U"]);

  if (wideLetters.has(char)) return fontSize * 0.72;
  if (narrowLetters.has(char)) return fontSize * 0.28;
  if (semiWideLetters.has(char)) return fontSize * 0.64;
  return fontSize * 0.56;
}

function getPositions(word: string, fontSize: number) {
  const chars = [...word];
  const gap = fontSize * 0.16;
  const advances = chars.map((char) => getLetterAdvance(char, fontSize));
  const totalWidth = advances.reduce((sum, advance) => sum + advance, 0) + gap * Math.max(0, chars.length - 1);
  let cursor = -totalWidth / 2;

  return advances.map((advance) => {
    const center = cursor + advance / 2;
    cursor += advance + gap;
    return center;
  });
}

function matchSharedLetters(current: string, next: string) {
  const usedNext = new Set<number>();
  const pairs: Array<{ currentIndex: number; nextIndex: number }> = [];

  [...current].forEach((char, currentIndex) => {
    let bestNextIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    [...next].forEach((nextChar, nextIndex) => {
      if (char !== nextChar || usedNext.has(nextIndex)) return;

      const distance = Math.abs(currentIndex - nextIndex);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestNextIndex = nextIndex;
      }
    });

    if (bestNextIndex >= 0) {
      usedNext.add(bestNextIndex);
      pairs.push({ currentIndex, nextIndex: bestNextIndex });
    }
  });

  return pairs;
}

function createLetter(char: string) {
  const glow = document.createElement("span");
  const text = document.createElement("span");

  glow.className = "photo-tube-letter photo-tube-letter--glow";
  text.className = "photo-tube-letter photo-tube-letter--text";
  glow.textContent = char;
  text.textContent = char;

  return { char, glow, text };
}

export function TubeTextScroll() {
  const wrapperRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const shotLabelRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    const init = async () => {
      const wrapper = wrapperRef.current;
      const text = textRef.current;
      const shotLabel = shotLabelRef.current;
      const caption = captionRef.current;
      const turbulence = turbulenceRef.current;
      const displacement = displacementRef.current;
      if (!wrapper || !text || !shotLabel || !caption || !turbulence || !displacement) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let cityIndex = 0;
        let letters: LetterNode[] = [];
        let timer: gsap.core.Tween | undefined;

        const fontSize = () => Number.parseFloat(window.getComputedStyle(text).fontSize);

        const setMelt = (amount: number) => {
          gsap.set(displacement, { attr: { scale: amount } });
          gsap.set(turbulence, {
            attr: { baseFrequency: amount > 0 ? "0.046 0.092" : "0.012 0.026" },
          });
        };

        const setLetterClear = (letter: LetterNode, x: number) => {
          gsap.set(letter.text, {
            filter: clearTextFilter,
            opacity: 1,
            scale: 1,
            textShadow: clearShadow,
            x,
            xPercent: -50,
            yPercent: -50,
          });
          gsap.set(letter.glow, {
            filter: clearGlowFilter,
            opacity: 1,
            scale: 1,
            x,
            xPercent: -50,
            yPercent: -50,
          });
        };

        const mountWord = (word: string) => {
          text.replaceChildren();
          const positions = getPositions(word, fontSize());
          letters = [...word].map((char, index) => {
            const letter = createLetter(char);
            text.append(letter.glow, letter.text);
            setLetterClear(letter, positions[index]);
            return letter;
          });
          setMelt(0);
        };

        const transition = () => {
          const currentWord = cityNames[cityIndex].en;
          const nextIndex = (cityIndex + 1) % cityNames.length;
          const nextWord = cityNames[nextIndex].en;
          const nextPositions = getPositions(nextWord, fontSize());
          const pairs = matchSharedLetters(currentWord, nextWord);
          const sharedCurrent = new Set(pairs.map((pair) => pair.currentIndex));
          const sharedNext = new Set(pairs.map((pair) => pair.nextIndex));
          const outgoing = letters.filter((_, index) => !sharedCurrent.has(index));
          const outgoingTargets = outgoing.flatMap((letter) => [letter.text, letter.glow]);
          const sharedTargets = pairs.flatMap((pair) => {
            const letter = letters[pair.currentIndex];
            return [letter.text, letter.glow];
          });
          const incoming = [...nextWord].map((char, index) => {
            if (sharedNext.has(index)) return null;
            const letter = createLetter(char);
            text.append(letter.glow, letter.text);
            gsap.set(letter.text, {
              filter: meltTextFilter,
              opacity: 0,
              scale: 1.12,
              textShadow: meltShadow,
              x: nextPositions[index],
              xPercent: -50,
              yPercent: -50,
            });
            gsap.set(letter.glow, {
              filter: meltGlowFilter,
              opacity: 0,
              scale: 1.36,
              x: nextPositions[index],
              xPercent: -50,
              yPercent: -50,
            });
            return letter;
          });
          const incomingTargets = incoming.flatMap((letter) => (letter ? [letter.text, letter.glow] : []));

          const tl = gsap.timeline({
            onComplete: () => {
              cityIndex = nextIndex;
              mountWord(nextWord);
              caption.textContent = cityNames[cityIndex].zh;
              gsap.set([shotLabel, caption], { filter: "blur(0px)", opacity: 1, y: 0 });
              timer = gsap.delayedCall(2.25, transition);
            },
          });

          tl.to(displacement, { attr: { scale: 46 }, duration: 0.62, ease: "power2.inOut" })
            .to(turbulence, { attr: { baseFrequency: "0.052 0.098" }, duration: 0.62, ease: "power2.inOut" }, "<")
            .to([shotLabel, caption], {
              filter: "blur(14px)",
              opacity: 0.18,
              y: (index) => (index === 0 ? -8 : 8),
              duration: 0.48,
              ease: "power2.inOut",
            }, "<")
            .to(
              outgoingTargets,
              {
                filter: (index) => (index % 2 === 0 ? meltTextFilter : meltGlowFilter),
                opacity: (index) => (index % 2 === 0 ? 0.08 : 0.64),
                scale: (index) => (index % 2 === 0 ? 1.14 : 1.2),
                textShadow: meltShadow,
                duration: 0.7,
                ease: "power2.inOut",
                stagger: 0.018,
              },
              "<",
            );

          tl.call(() => {
            caption.textContent = cityNames[nextIndex].zh;
          }, undefined, ">-=0.28");

          pairs.forEach((pair) => {
            const letter = letters[pair.currentIndex];
            tl.to(
              [letter.text, letter.glow],
              {
                x: nextPositions[pair.nextIndex],
                filter: (index) => (index === 0 ? clearTextFilter : clearGlowFilter),
                opacity: (index) => (index === 0 ? 1 : 1),
                textShadow: clearShadow,
                duration: 0.78,
                ease: "power2.inOut",
              },
              "<",
            );
          });

          tl.to(
            incomingTargets,
            {
              filter: (index) => (index % 2 === 0 ? clearTextFilter : clearGlowFilter),
              opacity: 1,
              scale: 1,
              textShadow: clearShadow,
              duration: 0.86,
              ease: "power3.out",
              stagger: 0.018,
            },
            ">-=0.54",
          )
            .to([shotLabel, caption], {
              filter: "blur(0px)",
              opacity: 1,
              y: 0,
              duration: 0.78,
              ease: "power3.out",
            }, "<")
            .to(displacement, { attr: { scale: 0 }, duration: 0.96, ease: "power3.out" }, "<")
            .to(turbulence, { attr: { baseFrequency: "0.012 0.026" }, duration: 0.96, ease: "power3.out" }, "<")
            .to(
              [...sharedTargets, ...incomingTargets],
              {
                filter: (index) => (index % 2 === 0 ? clearTextFilter : clearGlowFilter),
                opacity: 1,
                scale: 1,
                textShadow: clearShadow,
                duration: 0.48,
                ease: "power2.out",
              },
              ">-=0.18",
            )
            .to(
              outgoingTargets,
              {
                opacity: 0,
                scale: 0.98,
                duration: 0.42,
                ease: "power2.out",
              },
              "<",
            );
        };

        gsap.set(text, { xPercent: -50, yPercent: -50 });
        gsap.set([shotLabel, caption], { xPercent: -50, opacity: 1, filter: "blur(0px)" });
        caption.textContent = cityNames[0].zh;
        mountWord(cityNames[0].en);

        if (!reduceMotion) {
          timer = gsap.delayedCall(2.25, transition);

          gsap.to(text, {
            filter: "blur(1px)",
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          });
        }

        return () => timer?.kill();
      }, wrapper);

      cleanup = () => ctx.revert();
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section className="photo-tube-section" ref={wrapperRef} aria-label="City motion text">
      <svg className="photo-tube-filter" aria-hidden="true" focusable="false">
        <filter id="photo-tube-melt">
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.012 0.026"
            numOctaves="2"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div className="photo-tube-shot-label" ref={shotLabelRef} aria-hidden="true">
        Shot in
      </div>
      <div className="photo-tube-text" ref={textRef} aria-label="GUANGZHOU WENZHOU XIAMEN BEIHAI" />
      <div className="photo-tube-caption" ref={captionRef} aria-hidden="true" />
    </section>
  );
}
