import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { projects, getProjectById } from "@/content/projects/projects";
import page from "@/styles/page.module.scss";
import styles from "./detail.module.scss";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return { title: "Proyecto no encontrado" };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: [project.image],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  return (
    <>
      <main className={page.page}>
        <Link href="/projects" className={`mono ${styles.back}`}>
          <ArrowLeft size={14} /> Volver a proyectos
        </Link>

        <div className={styles.head}>
          <span className={`mono ${styles.num}`}>
            {project.number} / 06
          </span>
          <h1 className={`display ${styles.title}`}>{project.title}</h1>
          <div className={styles.meta}>
            <span className="mono">{project.category}</span>
            <span className="mono">{project.year}</span>
          </div>
        </div>

        <div className={styles.bar} aria-hidden />

        <div className={styles.media}>
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 88rem"
            className={styles.img}
          />
        </div>

        <div className={styles.info}>
          <div className={styles.about}>
            <span className={`mono ${styles.label}`}>Sobre el proyecto</span>
            <p className={styles.desc}>{project.description}</p>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.live}
            >
              <span className="mono">
                Ver el proyecto en vivo <ArrowUpRight size={16} />
              </span>
            </a>
          </div>

          <aside className={styles.side}>
            <span className={`mono ${styles.label}`}>Stack</span>
            <ul className={styles.stack}>
              {project.stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
