import { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Footer from "@/components/layout/Footer";
import {
  SITE_CONFIG,
  PHILOSOPHY,
  PHILOSOPHY_LINES,
  CAPABILITIES,
  TECH_STACK,
} from "@/lib/constants";
import page from "@/styles/page.module.scss";
import styles from "./about.module.scss";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: `Conoce a ${SITE_CONFIG.name}, ${SITE_CONFIG.role}. ${PHILOSOPHY}`,
};

const stack = TECH_STACK;

export default function AboutPage() {
  return (
    <>
      <main className={page.page}>
        <div className={page.head}>
          <span className={`mono ${page.eyebrow}`}>Sobre mí</span>
          <h1 className={`display ${page.title}`}>Aldy Jnx</h1>
          <p className={page.lead}>{SITE_CONFIG.role}</p>
        </div>

        <section className={styles.intro}>
          <Reveal className={`display ${styles.statement}`} stagger>
            {PHILOSOPHY_LINES.map((line, i) => (
              <span key={i} className={styles.line}>
                {line}
              </span>
            ))}
          </Reveal>
        </section>

        <section className={styles.cols}>
          <Reveal className={styles.block}>
            <span className={`mono ${styles.blockTitle}`}>Enfoque</span>
            <p className={styles.text}>
              Desarrollo aplicaciones de extremo a extremo: datos en PostgreSQL,
              APIs en NestJS, FastAPI o Django, e interfaces en React.
            </p>
            <p className={styles.text}>
              Código limpio, arquitectura mantenible y rendimiento. TypeScript y
              Python según el proyecto.
            </p>
          </Reveal>

          <Reveal className={styles.block}>
            <span className={`mono ${styles.blockTitle}`}>Stack</span>
            <ul className={styles.stack}>
              {stack.map((s) => (
                <li key={s} className={styles.chip}>
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className={styles.caps}>
          <span className={`mono ${styles.blockTitle}`}>Capacidades</span>
          <Reveal className={styles.capGrid} stagger>
            {CAPABILITIES.map((c) => (
              <article key={c.code} className={styles.capItem}>
                <span className={`mono ${styles.capCode}`}>{c.code}</span>
                <h3 className={styles.capTitle}>{c.title}</h3>
                <p className={styles.capDesc}>{c.description}</p>
              </article>
            ))}
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
