export interface TrendingItem {
  imdbId: string;
  slug: string;
  title: string;
  type: 'series' | 'movie';
  youtubeId: string;
  badge?: string;
  category: string;
}

export const HERO_FEATURED: TrendingItem = {
  imdbId: 'tt4574334',
  slug: 'stranger-things',
  title: 'Stranger Things',
  type: 'series',
  youtubeId: 'b9EkMc79ZSU',
  badge: 'Destacado',
  category: 'Destacado',
};

export const TRENDING_NOW: TrendingItem[] = [
  {
    imdbId: 'tt13443470',
    slug: 'wednesday',
    title: 'Wednesday',
    type: 'series',
    youtubeId: 'Q2dRfQwnFGc',
    badge: 'Top 1',
    category: 'Tendencias',
  },
  {
    imdbId: 'tt3581920',
    slug: 'the-last-of-us',
    title: 'The Last of Us',
    type: 'series',
    youtubeId: 'uLtkt8BonwM',
    badge: 'Nuevo',
    category: 'Tendencias',
  },
  {
    imdbId: 'tt11198330',
    slug: 'house-of-the-dragon',
    title: 'House of the Dragon',
    type: 'series',
    youtubeId: 'DotnJ7tTA34',
    badge: 'HOT',
    category: 'Tendencias',
  },
  {
    imdbId: 'tt10919420',
    slug: 'squid-game',
    title: 'Squid Game',
    type: 'series',
    youtubeId: 'oqxAJKy0ii4',
    category: 'Tendencias',
  },
  {
    imdbId: 'tt7366338',
    slug: 'chernobyl',
    title: 'Chernobyl',
    type: 'series',
    youtubeId: 's9APLXM9Ei8',
    category: 'Tendencias',
  },
  {
    imdbId: 'tt5753856',
    slug: 'dark',
    title: 'Dark',
    type: 'series',
    youtubeId: 'rrwycJ08PSA',
    category: 'Tendencias',
  },
];

export const CLASSICS: TrendingItem[] = [
  {
    imdbId: 'tt0903747',
    slug: 'breaking-bad',
    title: 'Breaking Bad',
    type: 'series',
    youtubeId: 'HhesaQXLuRY',
    badge: 'Clásico',
    category: 'Clásicos imperdibles',
  },
  {
    imdbId: 'tt0944947',
    slug: 'game-of-thrones',
    title: 'Game of Thrones',
    type: 'series',
    youtubeId: 'KPLWWIOCOOQ',
    category: 'Clásicos imperdibles',
  },
  {
    imdbId: 'tt3032476',
    slug: 'better-call-saul',
    title: 'Better Call Saul',
    type: 'series',
    youtubeId: 'NbAUYjJ5ZA8',
    category: 'Clásicos imperdibles',
  },
  {
    imdbId: 'tt2442560',
    slug: 'peaky-blinders',
    title: 'Peaky Blinders',
    type: 'series',
    youtubeId: 'oWPVVjlw7y0',
    category: 'Clásicos imperdibles',
  },
  {
    imdbId: 'tt6468322',
    slug: 'money-heist',
    title: 'La Casa de Papel',
    type: 'series',
    youtubeId: '_InqQJRqGW4',
    category: 'Clásicos imperdibles',
  },
  {
    imdbId: 'tt4786824',
    slug: 'the-crown',
    title: 'The Crown',
    type: 'series',
    youtubeId: 'JWtnJjn6ng0',
    category: 'Clásicos imperdibles',
  },
];

export const POPULAR_MOVIES: TrendingItem[] = [
  {
    imdbId: 'tt15398776',
    slug: 'oppenheimer',
    title: 'Oppenheimer',
    type: 'movie',
    youtubeId: 'uYPbbksJxIg',
    badge: 'Oscar',
    category: 'Películas populares',
  },
  {
    imdbId: 'tt1517268',
    slug: 'barbie',
    title: 'Barbie',
    type: 'movie',
    youtubeId: 'pBk4NYhWNMM',
    category: 'Películas populares',
  },
  {
    imdbId: 'tt9362722',
    slug: 'spider-verse',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    youtubeId: 'shW9i6k8cB0',
    category: 'Películas populares',
  },
  {
    imdbId: 'tt15239678',
    slug: 'dune-part-two',
    title: 'Dune: Part Two',
    type: 'movie',
    youtubeId: 'Way9Dexny3w',
    badge: 'Nuevo',
    category: 'Películas populares',
  },
  {
    imdbId: 'tt1160419',
    slug: 'dune',
    title: 'Dune',
    type: 'movie',
    youtubeId: 'n9xhJrPXop4',
    category: 'Películas populares',
  },
  {
    imdbId: 'tt6710474',
    slug: 'everything-everywhere',
    title: 'Everything Everywhere All at Once',
    type: 'movie',
    youtubeId: 'wxN1T1uxQ2g',
    category: 'Películas populares',
  },
];

export const ALL_ROWS = [
  { title: 'Tendencias ahora', items: TRENDING_NOW },
  { title: 'Películas populares', items: POPULAR_MOVIES },
  { title: 'Clásicos imperdibles', items: CLASSICS },
];

export const ALL_ITEMS: TrendingItem[] = [
  HERO_FEATURED,
  ...TRENDING_NOW,
  ...POPULAR_MOVIES,
  ...CLASSICS,
];

export function findBySlug(slug: string): TrendingItem | undefined {
  return ALL_ITEMS.find((i) => i.slug === slug);
}

export function findByImdbId(imdbId: string): TrendingItem | undefined {
  return ALL_ITEMS.find((i) => i.imdbId === imdbId);
}
