import { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "ecommerce-platform",
    number: "01",
    title: "Lumen Store",
    year: "2024",
    category: "Full-stack",
    description:
      "Plataforma de comercio electrónico con catálogo dinámico, carrito y pagos integrados con Stripe.",
    stack: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
    image: "/projects/p1.svg",
    liveUrl: "https://example.com",
  },
  {
    id: "task-manager",
    number: "02",
    title: "Cadence",
    year: "2024",
    category: "Web App",
    description:
      "Gestor de tareas colaborativo en tiempo real con arrastrar y soltar y gestión de equipos.",
    stack: ["React", "Firebase", "TypeScript"],
    image: "/projects/p2.svg",
    liveUrl: "https://example.com",
  },
  {
    id: "editorial-portfolio",
    number: "03",
    title: "Atelier Noir",
    year: "2024",
    category: "Sitio de marca",
    description:
      "Portafolio editorial con galería horizontal controlada por scroll y transiciones GSAP.",
    stack: ["Next.js", "GSAP", "Lenis", "SCSS"],
    image: "/projects/p3.svg",
    liveUrl: "https://example.com",
  },
  {
    id: "weather-dashboard",
    number: "04",
    title: "Aero",
    year: "2023",
    category: "Web App",
    description:
      "Panel del clima interactivo con pronósticos, gráficos y datos históricos en vivo.",
    stack: ["React", "Charts.js", "API"],
    image: "/projects/p4.svg",
    liveUrl: "https://example.com",
  },
  {
    id: "social-dashboard",
    number: "05",
    title: "Pulse",
    year: "2024",
    category: "Full-stack",
    description:
      "Dashboard de analíticas para gestionar múltiples cuentas de redes sociales y su rendimiento.",
    stack: ["Next.js", "PostgreSQL", "Charts"],
    image: "/projects/p5.svg",
    liveUrl: "https://example.com",
  },
  {
    id: "studio-landing",
    number: "06",
    title: "Forme Studio",
    year: "2023",
    category: "Landing",
    description:
      "Landing inmersiva para un estudio creativo con reveals por línea y scroll suave.",
    stack: ["Next.js", "GSAP", "SCSS"],
    image: "/projects/p6.svg",
    liveUrl: "https://example.com",
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
