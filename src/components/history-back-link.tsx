"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type HistoryBackLinkProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  tabIndex?: number;
  transitionVariant?: "more-exit";
};

const skipHomeIntroOnceKey = "bin-skip-home-intro-once";
const returnHomeFinalOnceKey = "bin-return-home-final-once";

function markHomeIntroSkipOnce() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(skipHomeIntroOnceKey, "1");
}

function markReturnHomeFinalOnce() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(returnHomeFinalOnceKey, "1");
}

export function HistoryBackLink({ children, className, "aria-label": ariaLabel, tabIndex, transitionVariant }: HistoryBackLinkProps) {
  const router = useRouter();
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (transitionVariant !== "more-exit") return;
    router.prefetch("/");
  }, [router, transitionVariant]);

  const navigateBack = () => {
    markHomeIntroSkipOnce();

    if (transitionVariant === "more-exit") {
      markReturnHomeFinalOnce();
      router.push("/", { scroll: false });
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();

    if (transitionVariant !== "more-exit") {
      navigateBack();
      return;
    }

    if (isTransitioningRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      navigateBack();
      return;
    }

    isTransitioningRef.current = true;

    const transition = document.createElement("div");
    transition.className = "more-page-transition";
    transition.setAttribute("aria-hidden", "true");
    transition.innerHTML = `
      <span class="more-page-transition__panel more-page-transition__panel--black more-page-transition__panel--left"></span>
      <span class="more-page-transition__panel more-page-transition__panel--black more-page-transition__panel--right"></span>
      <span class="more-page-transition__panel more-page-transition__panel--white more-page-transition__panel--left"></span>
      <span class="more-page-transition__panel more-page-transition__panel--white more-page-transition__panel--right"></span>
    `;
    document.body.appendChild(transition);

    const cleanupTransition = () => {
      transition.remove();
      isTransitioningRef.current = false;
    };

    void import("gsap")
      .then(({ gsap }) => {
        const blackPanels = Array.from(transition.querySelectorAll<HTMLElement>(".more-page-transition__panel--black"));
        const whitePanels = Array.from(transition.querySelectorAll<HTMLElement>(".more-page-transition__panel--white"));

        gsap.set(transition, { autoAlpha: 1 });
        gsap.set(blackPanels, { scaleX: 0, zIndex: 2 });
        gsap.set(whitePanels, { scaleX: 0, zIndex: 3 });
        void transition.offsetWidth;

        gsap
          .timeline({
            defaults: { overwrite: true },
            onComplete: cleanupTransition,
          })
          .to(blackPanels, {
            scaleX: 1,
            duration: 0.52,
            ease: "power4.inOut",
          })
          .to(
            whitePanels,
            {
              scaleX: 1,
              duration: 0.58,
              ease: "power4.inOut",
            },
            ">-0.08",
          )
          .call(navigateBack)
          .to(transition, {
            autoAlpha: 0,
            duration: 0.22,
            ease: "power1.out",
          }, "+=0.06");
      })
      .catch(() => {
        cleanupTransition();
        navigateBack();
      });
  };

  return (
    <Link className={className} href="/" scroll={false} aria-label={ariaLabel} tabIndex={tabIndex} onClick={handleClick}>
      {children}
    </Link>
  );
}
