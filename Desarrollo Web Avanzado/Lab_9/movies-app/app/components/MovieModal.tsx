'use client'

import { useEffect, useState } from 'react'
import type { TrendingItem } from '../lib/series'
import type { OmdbDetail } from '../lib/omdb'

interface Props {
  item: TrendingItem | null
  onClose: () => void
}

export default function MovieModal({ item, onClose }: Props) {
  const [detail, setDetail] = useState<OmdbDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!item) {
      setDetail(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)

    fetch(`/api/omdb/${item.imdbId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d?.error) setError(d.error)
        else setDetail(d)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el detalle')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [item])

  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  if (!item) return null

  const poster = detail?.Poster && detail.Poster !== 'N/A' ? detail.Poster : undefined

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-0 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-primary border border-border-soft rounded-none sm:rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="cursor-pointer absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="relative aspect-video bg-black overflow-hidden">
          {item.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              title={`${item.title} trailer`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            poster && (
              <img src={poster} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
            )
          )}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight drop-shadow-2xl">
              {item.title}
            </h2>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {loading && (
            <div className="space-y-3">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
              <div className="skeleton h-4 w-4/6 rounded" />
            </div>
          )}

          {error && !loading && <p className="text-foreground/70 text-sm">{error}</p>}

          {detail && !loading && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {detail.imdbRating && detail.imdbRating !== 'N/A' && (
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {detail.imdbRating} / 10
                    </span>
                  )}
                  {detail.Year && <span className="text-foreground/80">{detail.Year}</span>}
                  {detail.Rated && detail.Rated !== 'N/A' && (
                    <span className="px-2 py-0.5 border border-foreground/40 text-xs uppercase tracking-wide rounded">
                      {detail.Rated}
                    </span>
                  )}
                  {detail.Runtime && detail.Runtime !== 'N/A' && (
                    <span className="text-foreground/80">{detail.Runtime}</span>
                  )}
                  {detail.totalSeasons && (
                    <span className="text-foreground/80">{detail.totalSeasons} temporadas</span>
                  )}
                </div>

                {detail.Plot && detail.Plot !== 'N/A' && (
                  <p className="text-foreground/90 leading-relaxed">{detail.Plot}</p>
                )}
              </div>

              <aside className="space-y-3 text-sm">
                {detail.Genre && detail.Genre !== 'N/A' && (
                  <Field label="Géneros" value={detail.Genre} />
                )}
                {detail.Actors && detail.Actors !== 'N/A' && (
                  <Field label="Reparto" value={detail.Actors} />
                )}
                {detail.Director && detail.Director !== 'N/A' && (
                  <Field label="Director" value={detail.Director} />
                )}
                {detail.Writer && detail.Writer !== 'N/A' && (
                  <Field label="Guion" value={detail.Writer} />
                )}
                {detail.Language && detail.Language !== 'N/A' && (
                  <Field label="Idioma" value={detail.Language} />
                )}
                {detail.Awards && detail.Awards !== 'N/A' && (
                  <Field label="Premios" value={detail.Awards} />
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-foreground/50 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-foreground/90">{value}</p>
    </div>
  )
}
