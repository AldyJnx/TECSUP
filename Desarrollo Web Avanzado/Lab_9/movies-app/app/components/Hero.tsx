'use client'

import { useState } from 'react'
import type { TrendingItem } from '../lib/series'

interface Props {
  item: TrendingItem
  posterUrl?: string
  plot?: string
  rating?: string
  year?: string
  genre?: string
  onPlay?: () => void
}

export default function Hero({ item, posterUrl, plot, rating, year, genre, onPlay }: Props) {
  const [showVideo, setShowVideo] = useState(false)

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-black">
      <div className="absolute inset-0 -z-0">
        {posterUrl && posterUrl !== 'N/A' && (
          <img
            src={posterUrl}
            alt={item.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              showVideo ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}
        {item.youtubeId && (
          <iframe
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${item.youtubeId}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1`}
            title={`${item.title} trailer`}
            allow="autoplay; encrypted-media"
            onLoad={() => setShowVideo(true)}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] min-w-full h-[56.25vw] min-h-full pointer-events-none transition-opacity duration-1000 ${
              showVideo ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-28 lg:pb-32">
        <div className="max-w-2xl animate-fade-in-up">
          {item.badge && (
            <span className="inline-block mb-4 px-3 py-1 text-xs font-bold tracking-widest uppercase bg-accent text-white rounded">
              {item.badge}
            </span>
          )}
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-4 drop-shadow-2xl">
            {item.title}
          </h1>

          <div className="flex items-center gap-3 mb-4 text-sm text-foreground/80">
            {rating && rating !== 'N/A' && (
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {rating}
              </span>
            )}
            {year && <span>{year}</span>}
            {genre && <span className="text-foreground/60">{genre}</span>}
          </div>

          {plot && (
            <p className="text-base lg:text-lg text-foreground/90 leading-relaxed mb-6 line-clamp-3 drop-shadow-lg">
              {plot}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onPlay}
              className="cursor-pointer flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-white/85 transition-all hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Reproducir
            </button>
            <button
              onClick={onPlay}
              className="cursor-pointer flex items-center gap-2 bg-white/15 text-white font-semibold px-6 py-3 rounded-md hover:bg-white/25 backdrop-blur transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 17h2v-6h-2zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8M11 9h2V7h-2z" />
              </svg>
              Más información
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
