'use client'

import { useEffect, useMemo, useState } from 'react'
import type { OmdbSearchItem } from '../lib/omdb'
import type { TrendingItem } from '../lib/series'
import { ALL_ITEMS } from '../lib/series'
import MovieModal from '../components/MovieModal'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OmdbSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<TrendingItem | null>(null)
  const [noKey, setNoKey] = useState(false)

  const localById = useMemo(() => {
    const map = new Map<string, TrendingItem>()
    for (const it of ALL_ITEMS) map.set(it.imdbId, it)
    return map
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setNoKey(false)
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/omdb/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        const data = await r.json()
        setResults(data.results ?? [])
        setNoKey((data.results?.length ?? 0) === 0 && !process.env.NEXT_PUBLIC_HAS_KEY)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [query])

  const openDetail = (r: OmdbSearchItem) => {
    const local = localById.get(r.imdbID)
    const item: TrendingItem = local ?? {
      imdbId: r.imdbID,
      slug: r.imdbID,
      title: r.Title,
      type: r.Type === 'series' ? 'series' : 'movie',
      youtubeId: '',
      category: 'Búsqueda',
    }
    setActive(item)
  }

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-black mb-2">Buscar</h1>
          <p className="text-foreground/60">
            Encuentra películas y series. Resultados en tiempo real desde OMDb.
          </p>
        </header>

        <div className="relative mb-10">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar título, serie, película..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-4 bg-muted border border-border-soft rounded-xl text-lg placeholder:text-foreground/40 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg skeleton" />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-foreground/70 mb-2">No se encontraron resultados.</p>
            {noKey && (
              <p className="text-foreground/50 text-sm">
                Si recién instalaste el proyecto, configura OMDB_API_KEY en .env.local.
              </p>
            )}
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-20 text-foreground/50">
            Empieza a escribir para buscar.
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
            {results.map((r) => (
              <button
                key={r.imdbID}
                type="button"
                onClick={() => openDetail(r)}
                className="cursor-pointer group text-left transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                  {r.Poster && r.Poster !== 'N/A' ? (
                    <img
                      src={r.Poster}
                      alt={r.Title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground/40 text-xs px-3 text-center">
                      Sin póster
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-2">
                  <p className="font-semibold text-sm line-clamp-2">{r.Title}</p>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    {r.Year} · {r.Type === 'series' ? 'Serie' : r.Type === 'movie' ? 'Película' : r.Type}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <MovieModal item={active} onClose={() => setActive(null)} />
    </div>
  )
}
