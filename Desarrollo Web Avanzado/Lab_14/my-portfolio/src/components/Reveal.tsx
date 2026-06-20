"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/components/providers/SmoothScroll";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  /** stagger direct children instead of animating the wrapper as one block */
  stagger?: boolean;
};

export default function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 40,
  stagger = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const targets = stagger ? Array.from(el.children) : el;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 1,
        delay,
        ease: "power3.out",
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [delay, y, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
