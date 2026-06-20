"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/content/projects/projects";
import {
  useSmoothScroll,
  prefersReducedMotion,
} from "@/components/providers/SmoothScroll";
import styles from "./ProjectsGallery.module.scss";

const clamp = (min: number, max: number, v: number) =>
  Math.max(min, Math.min(max, v));

export default function ProjectsGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef(0);
  const current = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const snapTimer = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  const ss = useSmoothScroll();
  const ssRef = useRef(ss);
  ssRef.current = ss;
  const count = projects.length;

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }

    // Always start at the first project
    target.current = 0;
    current.current = 0;
    setActive(0);

    // Disable page smooth scroll while the gallery owns the wheel.
    // Retry because Lenis is created by the parent effect, which runs
    // after this (child) effect on the initial mount.
    let stopped = false;
    const tryStop = () => {
      if (stopped) return;
      if (ssRef.current.lenis) {
        ssRef.current.stop();
        stopped = true;
      }
    };
    tryStop();
    const stopRetry = window.setInterval(tryStop, 60);
    window.setTimeout(() => window.clearInterval(stopRetry), 1000);

    let raf = 0;
    let spacing = 360;

    const measure = () => {
      const card = cardsRef.current[0];
      if (card) spacing = card.offsetWidth * 0.62;
    };
    measure();
    window.addEventListener("resize", measure);

    const scheduleSnap = () => {
      if (snapTimer.current) window.clearTimeout(snapTimer.current);
      snapTimer.current = window.setTimeout(() => {
        target.current = clamp(0, count - 1, Math.round(target.current));
      }, 140);
    };

    const render = () => {
      current.current += (target.current - current.current) * 0.09;
      const cur = current.current;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const offset = i - cur;
        const abs = Math.abs(offset);
        const x = offset * spacing;
        const rotateY = clamp(-42, 42, -offset * 16);
        const z = -abs * 230;
        const scale = Math.max(0.52, 1 - abs * 0.14);
        const opacity = abs > 3.3 ? 0 : Math.max(0, 1 - abs * 0.26);
        card.style.transform = `translate3d(calc(-50% + ${x}px), -50%, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = `${opacity}`;
        card.style.zIndex = `${100 - Math.round(abs * 10)}`;
        card.style.pointerEvents = abs < 0.5 ? "auto" : "none";
      });

      const act = clamp(0, count - 1, Math.round(cur));
      setActive((prev) => (prev !== act ? act : prev));

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target.current = clamp(0, count - 1, target.current + delta * 0.0022);
      scheduleSnap();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        target.current = clamp(0, count - 1, Math.round(target.current) + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        target.current = clamp(0, count - 1, Math.round(target.current) - 1);
      }
    };

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastX.current = e.clientX;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      target.current = clamp(0, count - 1, target.current - dx / spacing);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      target.current = clamp(0, count - 1, Math.round(target.current));
    };

    const track = trackRef.current;
    track?.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    track?.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      track?.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      track?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (snapTimer.current) window.clearTimeout(snapTimer.current);
      ssRef.current.start();
    };
  }, [count]);

  const goTo = (i: number) => {
    target.current = clamp(0, count - 1, i);
  };

  // Reduced-motion / no-JS fallback: plain accessible grid
  if (reduced) {
    return (
      <section className={styles.fallback}>
        <h1 className={`display ${styles.fbTitle}`}>Proyectos</h1>
        <div className={styles.fbGrid}>
          {projects.map((p) => (
            <a
              key={p.id}
              href={p.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fbCard}
            >
              <Image src={p.image} alt={p.title} width={600} height={750} />
              <div className={styles.fbInfo}>
                <span className="mono">
                  {p.number} / 0{count}
                </span>
                <h2 className="display">{p.title}</h2>
                <span className="mono">
                  {p.category} · {p.year}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }

  const activeProject = projects[active];

  return (
    <section
      className={styles.gallery}
      aria-roledescription="carrusel"
      aria-label="Galería de proyectos"
    >
      <div className={styles.head}>
        <h1 className={`mono ${styles.kicker}`}>Proyectos seleccionados</h1>
        <span className={`mono ${styles.counter}`}>
          {activeProject.number} / 0{count}
        </span>
      </div>

      <div
        className={styles.track}
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label="Usa la rueda, arrastra o las flechas para navegar"
      >
        <div className={styles.stage}>
          {projects.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className={styles.card}
              aria-hidden={i !== active}
            >
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardLink}
                tabIndex={i === active ? 0 : -1}
              >
                <div className={styles.cardImg}>
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 80vw, 28rem"
                    priority={i < 2}
                    draggable={false}
                  />
                </div>
                <div className={styles.cardMeta}>
                  <span className={`mono ${styles.cardNum}`}>{p.number}</span>
                  <h2 className={`display ${styles.cardTitle}`}>{p.title}</h2>
                  <div className={styles.cardRow}>
                    <span className="mono">{p.year}</span>
                    <span className="mono">{p.stack.join(" · ")}</span>
                  </div>
                  <span className={`mono ${styles.cardCta}`}>
                    Ver el proyecto en vivo <ArrowUpRight size={14} />
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.foot}>
        <span className={`mono ${styles.hint}`}>
          Desliza · Rueda · Flechas
        </span>
        <div className={styles.dots} role="tablist" aria-label="Ir a proyecto">
          {projects.map((p, i) => (
            <button
              key={p.id}
              className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
              aria-label={`Ir a ${p.title}`}
              aria-selected={i === active}
              role="tab"
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
