interface BookCoverProps {
  title: string
  src?: string | null
  className?: string
}

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
]

function gradientFor(title: string) {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + hash * 31
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default function BookCover({
  title,
  src,
  className = '',
}: BookCoverProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={title}
        className={`object-cover ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center bg-linear-to-br p-3 text-center ${gradientFor(
        title
      )} ${className}`}
    >
      <span className="line-clamp-4 text-sm font-semibold leading-tight text-white drop-shadow">
        {title}
      </span>
    </div>
  )
}
