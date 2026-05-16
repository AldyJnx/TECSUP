'use client'

import type { TrendingItem } from '../lib/series'

interface Props {
  item: TrendingItem
  posterUrl?: string
  year?: string
  rating?: string
  onClick: (item: TrendingItem) => void
  rank?: number
}

export default function PosterCard({ item, posterUrl, year, rating, onClick, rank }: Props) {
  const hasPoster = posterUrl && posterUrl !== 'N/A'

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      aria-label={`Ver detalle de ${item.title}`}
      className="cursor-pointer group relative shrink-0 w-44 sm:w-52 lg:w-60 aspect-[2/3] rounded-lg overflow-hidden bg-muted transition-transform duration-300 ease-out hover:scale-110 hover:z-20 focus:scale-110 focus:z-20 focus:outline-none focus:ring-2 focus:ring-accent shadow-lg hover:shadow-2xl"
    >
      {rank !== undefined && (
        <span className="absolute top-2 left-2 z-10 text-7xl font-black text-white/90 leading-none drop-shadow-lg select-none">
          {rank}
        </span>
      )}

      {item.badge && (
        <span className="absolute top-2 right-2 z-10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-accent text-white rounded">
          {item.badge}
        </span>
      )}

      {hasPoster ? (
        <img
          src={posterUrl}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary flex items-center justify-center p-4">
          <p className="text-center text-sm font-semibold text-foreground/80">{item.title}</p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black via-black/85 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
        <p className="text-sm font-semibold line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-white/70">
          {rating && rating !== 'N/A' && (
            <span className="flex items-center gap-0.5 text-yellow-400">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {rating}
            </span>
          )}
          {year && <span>{year}</span>}
          <span className="uppercase tracking-wide">{item.type === 'series' ? 'Serie' : 'Película'}</span>
        </div>
      </div>
    </button>
  )
}
