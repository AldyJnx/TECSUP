import { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/ContactForm";
import { SITE_CONFIG } from "@/lib/constants";
import page from "@/styles/page.module.scss";
import styles from "./contact.module.scss";

export const metadata: Metadata = {
  title: "Contacto",
  description: `¿Tienes un proyecto en mente? Escríbeme a ${SITE_CONFIG.email} y construyamos algo juntos.`,
};

export default function ContactPage() {
  return (
    <>
      <main className={page.page}>
        <div className={page.head}>
          <span className={`mono ${page.eyebrow}`}>06 — Contacto</span>
          <h1 className={`display ${page.title}`}>Hablemos</h1>
          <p className={page.lead}>
            ¿Tienes un proyecto o una idea? Cuéntame y te responderé lo antes
            posible.
          </p>
        </div>

        <div className={styles.body}>
          <aside className={styles.info}>
            <div className={styles.infoItem}>
              <span className={`mono ${styles.infoLabel}`}>Correo</span>
              <a href={SITE_CONFIG.links.email} className={styles.infoValue}>
                {SITE_CONFIG.email}
              </a>
            </div>
            <div className={styles.infoItem}>
              <span className={`mono ${styles.infoLabel}`}>Ubicación</span>
              <span className={styles.infoValue}>{SITE_CONFIG.location}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={`mono ${styles.infoLabel}`}>Redes</span>
              <span className={styles.infoValue}>
                <a href={SITE_CONFIG.links.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                {" · "}
                <a href={SITE_CONFIG.links.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </span>
            </div>
          </aside>

          <div className={styles.formWrap}>
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
