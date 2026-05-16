'use client'

import { useState } from 'react'
import type { TrendingItem } from '../lib/series'
import Hero from './Hero'
import PosterRow from './PosterRow'
import MovieModal from './MovieModal'

export interface ItemMeta {
  posterUrl?: string
  year?: string
  rating?: string
  plot?: string
  genre?: string
}

interface Row {
  title: string
  items: TrendingItem[]
  numbered?: boolean
}

interface Props {
  hero: TrendingItem
  rows: Row[]
  metaByImdbId: Record<string, ItemMeta>
}

export default function HomeShell({ hero, rows, metaByImdbId }: Props) {
  const [active, setActive] = useState<TrendingItem | null>(null)
  const heroMeta = metaByImdbId[hero.imdbId] ?? {}

  return (
    <>
      <Hero
        item={hero}
        posterUrl={heroMeta.posterUrl}
        plot={heroMeta.plot}
        rating={heroMeta.rating}
        year={heroMeta.year}
        genre={heroMeta.genre}
        onPlay={() => setActive(hero)}
      />

      <div className="-mt-24 lg:-mt-32 relative z-10 space-y-2">
        {rows.map((row) => (
          <PosterRow
            key={row.title}
            title={row.title}
            items={row.items}
            metaByImdbId={metaByImdbId}
            numbered={row.numbered}
            onItemClick={setActive}
          />
        ))}
      </div>

      <MovieModal item={active} onClose={() => setActive(null)} />
    </>
  )
}
