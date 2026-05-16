import { HERO_FEATURED, TRENDING_NOW, POPULAR_MOVIES, CLASSICS, ALL_ITEMS } from './lib/series'
import { getOmdbByIds } from './lib/omdb'
import HomeShell, { type ItemMeta } from './components/HomeShell'

export const revalidate = 3600

export default async function Home() {
  const detailsById = await getOmdbByIds(ALL_ITEMS.map((i) => i.imdbId))

  const metaByImdbId: Record<string, ItemMeta> = {}
  for (const item of ALL_ITEMS) {
    const d = detailsById[item.imdbId]
    if (!d) continue
    metaByImdbId[item.imdbId] = {
      posterUrl: d.Poster && d.Poster !== 'N/A' ? d.Poster : undefined,
      year: d.Year,
      rating: d.imdbRating,
      plot: d.Plot,
      genre: d.Genre,
    }
  }

  const rows = [
    { title: 'Tendencias ahora', items: TRENDING_NOW, numbered: true },
    { title: 'Películas populares', items: POPULAR_MOVIES },
    { title: 'Clásicos imperdibles', items: CLASSICS },
  ]

  return <HomeShell hero={HERO_FEATURED} rows={rows} metaByImdbId={metaByImdbId} />
}
