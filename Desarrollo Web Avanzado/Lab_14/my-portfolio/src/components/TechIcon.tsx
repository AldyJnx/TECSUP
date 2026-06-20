import {
  siReact,
  siNestjs,
  siPostgresql,
  siFastapi,
  siDjango,
  siTypescript,
  siPython,
  siDocker,
  siNodedotjs,
} from "simple-icons";

const ICONS: Record<string, { title: string; path: string }> = {
  react: siReact,
  nestjs: siNestjs,
  postgresql: siPostgresql,
  fastapi: siFastapi,
  django: siDjango,
  typescript: siTypescript,
  python: siPython,
  docker: siDocker,
  node: siNodedotjs,
};

export default function TechIcon({
  name,
  size = 22,
}: {
  name: string;
  size?: number;
}) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}
