"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LenisCtx = {
  lenisRef: RefObject<Lenis | null>;
  get lenis(): Lenis | null;
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<LenisCtx | null>(null);

export const useSmoothScroll = (): LenisCtx => {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    const empty: RefObject<Lenis | null> = { current: null };
    return {
      lenisRef: empty,
      get lenis() {
        return null;
      },
      stop: () => {},
      start: () => {},
    };
  }
  return ctx;
};

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const ctx = useMemo<LenisCtx>(
    () => ({
      lenisRef,
      get lenis() {
        return lenisRef.current;
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    []
  );

  return (
    <SmoothScrollContext.Provider value={ctx}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
