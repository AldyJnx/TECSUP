interface AvatarProps {
  name: string
  src?: string | null
  size?: number
}

// Paleta de fondos para el fallback con iniciales
const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-600',
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}

function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Avatar({ name, src, size = 48 }: AvatarProps) {
  const style = { width: size, height: size }
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={style}
        className="shrink-0 rounded-full object-cover ring-2 ring-white shadow"
      />
    )
  }
  return (
    <div
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white shadow ${colorFor(
        name
      )}`}
    >
      <span style={{ fontSize: size * 0.36 }}>{initials(name)}</span>
    </div>
  )
}
