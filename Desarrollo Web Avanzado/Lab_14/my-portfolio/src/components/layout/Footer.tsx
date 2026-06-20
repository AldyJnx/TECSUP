import Link from "next/link";
import { SITE_CONFIG, NAV_LINKS } from "@/lib/constants";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.cta}>
          <span className={`mono ${styles.eyebrow}`}>06 — Colaboremos</span>
          <a href={SITE_CONFIG.links.email} className={`display ${styles.big}`}>
            Hablemos
          </a>
        </div>

        <div className={styles.cols}>
          <nav className={styles.col} aria-label="Pie">
            <span className={`mono ${styles.colTitle}`}>Menú</span>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={styles.colLink}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className={styles.col}>
            <span className={`mono ${styles.colTitle}`}>Redes</span>
            <a href={SITE_CONFIG.links.github} target="_blank" rel="noopener noreferrer" className={styles.colLink}>
              GitHub
            </a>
            <a href={SITE_CONFIG.links.linkedin} target="_blank" rel="noopener noreferrer" className={styles.colLink}>
              LinkedIn
            </a>
            <a href={SITE_CONFIG.links.email} className={styles.colLink}>
              Email
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className="mono">
          © {year} {SITE_CONFIG.name}
        </span>
        <span className="mono">{SITE_CONFIG.location}</span>
        <span className="mono">Hecho con Next.js · GSAP · Lenis</span>
      </div>
    </footer>
  );
}
