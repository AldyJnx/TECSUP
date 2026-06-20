"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG, NAV_LINKS } from "@/lib/constants";
import styles from "./Nav.module.scss";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label={SITE_CONFIG.name}>
          <span className={styles.mark}>{SITE_CONFIG.initials}</span>
          <span className={styles.name}>{SITE_CONFIG.name}</span>
        </Link>

        <nav className={styles.links} aria-label="Principal">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          className={styles.burger}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`${styles.bar} ${open ? styles.barOpen1 : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barOpen2 : ""}`} />
        </button>
      </div>

      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}>
        <nav className={styles.overlayLinks} aria-label="Móvil">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.overlayLink}
              style={{ transitionDelay: `${0.05 + i * 0.05}s` }}
            >
              <span className={styles.overlayIndex}>0{i + 1}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <a href={SITE_CONFIG.links.email} className={styles.overlayEmail}>
          {SITE_CONFIG.email}
        </a>
      </div>
    </header>
  );
}
