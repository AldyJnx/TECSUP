import { Capability, Service } from "@/types";

export const SITE_CONFIG = {
  name: "Aldy Jnx",
  initials: "AJ",
  role: "Desarrollador Full Stack",
  title: "Aldy Jnx — Desarrollador Full Stack",
  description:
    "Desarrollador full stack. Construyo aplicaciones web desde cero: arquitectura sólida, código mantenible y atención al detalle en cada capa.",
  url: "https://aldyjnx.com",
  email: "aldyjenxymc@gmail.com",
  location: "Remoto · Lima, Perú",
  links: {
    github: "https://github.com/aldyjnx",
    linkedin: "https://linkedin.com/in/aldyjnx",
    email: "mailto:aldyjenxymc@gmail.com",
  },
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Proyectos" },
  { href: "/services", label: "Servicios" },
  { href: "/about", label: "Sobre mí" },
  { href: "/contact", label: "Contacto" },
];

export const PHILOSOPHY =
  "Construyo software que dura: arquitectura limpia, APIs sólidas y datos bien modelados.";

export const PHILOSOPHY_LINES = [
  "Construyo software que dura.",
  "Arquitectura limpia. APIs sólidas. Datos bien modelados.",
  "Soluciones a medida, no plantillas.",
];

export const TECH_STACK = [
  "NestJS",
  "React",
  "PostgreSQL",
  "FastAPI",
  "Django",
  "TypeScript",
  "Python",
  "Node.js",
  "Docker",
];

export const CAPABILITIES: Capability[] = [
  {
    code: "A.01",
    title: "Aplicaciones a medida",
    description:
      "Desarrollo de extremo a extremo, del modelo de datos a la interfaz.",
  },
  {
    code: "A.02",
    title: "APIs y backend",
    description: "APIs robustas y escalables con NestJS, FastAPI y Django.",
  },
  {
    code: "A.03",
    title: "Bases de datos",
    description: "Modelado, consultas y optimización con PostgreSQL.",
  },
  {
    code: "A.04",
    title: "Front-end moderno",
    description: "Interfaces con React y TypeScript: accesibles y rápidas.",
  },
];

export const SERVICES: Service[] = [
  {
    code: "S.01",
    title: "Aplicaciones a medida",
    description:
      "Webs, plataformas y paneles construidos de extremo a extremo.",
    image: "/services/s1.svg",
    tech: ["react", "nestjs", "postgresql"],
  },
  {
    code: "S.02",
    title: "APIs y arquitectura backend",
    description: "APIs REST con NestJS, FastAPI o Django, listas para escalar.",
    image: "/services/s2.svg",
    tech: ["nestjs", "fastapi", "django"],
  },
  {
    code: "S.03",
    title: "Desarrollo front-end",
    description: "Interfaces con React y TypeScript, listas para producción.",
    image: "/services/s3.svg",
    tech: ["react", "typescript"],
  },
  {
    code: "S.04",
    title: "Optimización y migración",
    description: "Rendimiento, refactor de código heredado y migraciones.",
    image: "/services/s4.svg",
    tech: ["postgresql", "python", "docker"],
  },
];
