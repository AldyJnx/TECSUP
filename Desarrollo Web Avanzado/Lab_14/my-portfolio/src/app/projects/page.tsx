import { Metadata } from "next";
import ProjectsGallery from "@/components/projects/ProjectsGallery";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Galería de proyectos seleccionados, navegable con la rueda, el arrastre o las flechas. Cada proyecto enlaza a su sitio en vivo.",
  openGraph: {
    title: "Proyectos",
    description:
      "Galería horizontal de proyectos seleccionados de desarrollo front-end.",
    images: ["/og-image.jpg"],
  },
};

export default function ProjectsPage() {
  return <ProjectsGallery />;
}
