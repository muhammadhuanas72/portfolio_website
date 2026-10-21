import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
export const MOBILE = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis = null;

// Smooth scrolling driven by GSAP's ticker so ScrollTrigger always reads the smoothed position.
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Fonts and images change layout after first paint; re-measure triggers once they settle.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      lenis = null;
    };
  }, []);
}

// Freeze smooth scrolling while a modal is open, so the wheel scrolls the modal, not the page.
export function pauseScroll(paused) {
  if (paused) lenis?.stop();
  else lenis?.start();
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

// Scoped GSAP setup. `add(query, fn)` registers animations for a media query; everything
// created here (tweens, ScrollTriggers, media queries) is reverted on unmount.
export function useGsap(scopeRef, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const add = (query, fn) => mm.add(query, fn, scopeRef);
    const ctx = gsap.context(() => setup(add), scopeRef);
    return () => {
      mm.revert();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
