'use client'

import { useRef, useState, useEffect } from 'react'
import type { TrendingItem } from '../lib/series'
import type { ItemMeta } from './HomeShell'
import PosterCard from './PosterCard'

interface Props {
  title: string
  items: TrendingItem[]
  metaByImdbId: Record<string, ItemMeta>
  numbered?: boolean
  onItemClick: (item: TrendingItem) => void
}

export default function PosterRow({ title, items, metaByImdbId, numbered, onItemClick }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const update = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    update()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.85
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="relative py-6 lg:py-8 animate-fade-in">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 px-6 lg:px-10 max-w-screen-2xl mx-auto">
        {title}
      </h2>

      <div className="relative group/row">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scroll('left')}
            className="cursor-pointer hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 lg:w-16 items-center justify-center bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="m15.41 16.59-4.58-4.59 4.58-4.59L14 6l-6 6 6 6z" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="row-scroll overflow-x-auto px-6 lg:px-10 max-w-screen-2xl mx-auto"
        >
          <div className="flex gap-3 lg:gap-4 pb-8 pt-2">
            {items.map((item, i) => {
              const meta = metaByImdbId[item.imdbId] ?? {}
              return (
                <PosterCard
                  key={`${item.imdbId}-${item.slug}`}
                  item={item}
                  posterUrl={meta.posterUrl}
                  year={meta.year}
                  rating={meta.rating}
                  onClick={onItemClick}
                  rank={numbered ? i + 1 : undefined}
                />
              )
            })}
          </div>
        </div>

        {canScrollRight && (
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scroll('right')}
            className="cursor-pointer hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 lg:w-16 items-center justify-center bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </button>
        )}
      </div>
    </section>
  )
}
