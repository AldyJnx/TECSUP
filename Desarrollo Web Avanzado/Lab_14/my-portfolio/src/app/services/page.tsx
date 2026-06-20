import { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import Footer from "@/components/layout/Footer";
import TechIcon from "@/components/TechIcon";
import { SERVICES } from "@/lib/constants";
import page from "@/styles/page.module.scss";
import styles from "./services.module.scss";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Aplicaciones empresariales a medida, APIs y arquitectura backend, desarrollo front-end y optimización de sistemas existentes.",
};

export default function ServicesPage() {
  return (
    <>
      <main className={page.page}>
        <div className={page.head}>
          <span className={`mono ${page.eyebrow}`}>Servicios</span>
          <h1 className={`display ${page.title}`}>Lo que hago</h1>
          <p className={page.lead}>
            Trabajo con equipos y empresas que necesitan software a medida:
            del modelo de datos a la interfaz, con código mantenible.
          </p>
        </div>

        <div className={styles.list}>
          {SERVICES.map((s) => (
            <Reveal key={s.code} className={styles.item}>
              <div className={styles.text}>
                <span className={`mono ${styles.code}`}>{s.code}</span>
                <h2 className={`display ${styles.title}`}>{s.title}</h2>
                <p className={styles.desc}>{s.description}</p>
                {s.tech && (
                  <div className={styles.tech} aria-label="Tecnologías">
                    {s.tech.map((t) => (
                      <span key={t} className={styles.techIcon}>
                        <TechIcon name={t} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {s.image && (
                <div className={styles.media}>
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className={styles.img}
                  />
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
