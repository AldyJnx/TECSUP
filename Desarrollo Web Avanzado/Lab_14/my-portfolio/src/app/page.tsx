import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import Footer from "@/components/layout/Footer";
import {
  SITE_CONFIG,
  PHILOSOPHY_LINES,
  CAPABILITIES,
  SERVICES,
} from "@/lib/constants";
import { projects } from "@/content/projects/projects";
import styles from "./home.module.scss";

export default function HomePage() {
  const selected = projects.slice(0, 4);

  return (
    <main className={styles.main}>
      {/* 01 — Hero */}
      <section className={styles.hero} id="inicio">
        <div className={styles.heroTop}>
          <span className="mono">01 — Portafolio</span>
          <span className="mono">{SITE_CONFIG.location}</span>
        </div>
        <h1 className={`display ${styles.heroTitle}`}>
          <span>Aldy</span>
          <span className={styles.heroTitleOutline}>Jnx</span>
        </h1>
        <div className={styles.bar} aria-hidden />
        <div className={styles.heroBottom}>
          <p className={styles.heroLead}>{SITE_CONFIG.description}</p>
          <Link href="/projects" className={`mono ${styles.heroCta}`}>
            Ver proyectos →
          </Link>
        </div>
      </section>

      {/* 02 — Filosofía */}
      <section className={`${styles.section} ${styles.empty}`} id="filosofia" data-wm="02">
        <Reveal as="span" className={`mono ${styles.eyebrow}`}>
          02 — Filosofía
        </Reveal>
        <Reveal className={`display ${styles.statement}`} stagger>
          {PHILOSOPHY_LINES.map((line, i) => (
            <span key={i} className={styles.line}>
              {line}
            </span>
          ))}
        </Reveal>
      </section>

      {/* 03 — Capacidades */}
      <section className={`${styles.section} ${styles.empty} ${styles.emptyL}`} id="capacidades" data-wm="03">
        <span className={`mono ${styles.eyebrow}`}>03 — Capacidades</span>
        <Reveal className={styles.capList} stagger>
          {CAPABILITIES.map((cap) => (
            <article key={cap.code} className={styles.capItem}>
              <span className={`mono ${styles.capCode}`}>{cap.code}</span>
              <h3 className={styles.capTitle}>{cap.title}</h3>
              <p className={styles.capDesc}>{cap.description}</p>
            </article>
          ))}
        </Reveal>
      </section>

      {/* 04 — Proyectos seleccionados */}
      <section className={styles.section} id="proyectos">
        <div className={styles.sectionHead}>
          <span className={`mono ${styles.eyebrow}`}>04 — Selección</span>
          <Link href="/projects" className={`mono ${styles.headLink}`}>
            Todos los proyectos →
          </Link>
        </div>
        <Reveal className={styles.projList} stagger>
          {selected.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className={styles.projRow}
            >
              <span className={`mono ${styles.projNum}`}>{p.number}</span>
              <span className={`display ${styles.projName}`}>{p.title}</span>
              <span className={styles.projThumb}>
                <Image
                  src={p.image}
                  alt={p.title}
                  width={300}
                  height={200}
                  loading="lazy"
                />
              </span>
              <span className={`mono ${styles.projMeta}`}>
                {p.category} · {p.year}
              </span>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* 05 — Servicios */}
      <section className={styles.section} id="servicios">
        <span className={`mono ${styles.eyebrow}`}>05 — Servicios</span>
        <Reveal className={styles.servList} stagger>
          {SERVICES.map((s) => (
            <article key={s.code} className={styles.servItem}>
              <span className={`mono ${styles.servCode}`}>{s.code}</span>
              <h3 className={`display ${styles.servTitle}`}>{s.title}</h3>
              <p className={styles.servDesc}>{s.description}</p>
            </article>
          ))}
        </Reveal>
      </section>

      {/* 06 — Contacto */}
      <Footer />
    </main>
  );
}
