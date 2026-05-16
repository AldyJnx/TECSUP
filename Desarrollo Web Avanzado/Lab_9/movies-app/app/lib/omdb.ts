import axios from 'axios';

const API_KEY = process.env.OMDB_API_KEY ?? 'f1def80d';
const BASE_URL = 'https://www.omdbapi.com/';

export interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  totalSeasons?: string;
  Response: 'True' | 'False';
  Error?: string;
}

export async function searchOmdb(query: string): Promise<OmdbSearchItem[]> {
  if (!API_KEY || !query.trim()) return [];

  try {
    const { data } = await axios.get(BASE_URL, {
      params: { apikey: API_KEY, s: query },
      timeout: 5000,
    });
    if (data.Response === 'False') return [];
    return data.Search ?? [];
  } catch {
    return [];
  }
}

export async function getOmdbById(imdbId: string): Promise<OmdbDetail | null> {
  if (!API_KEY) return null;

  try {
    const { data } = await axios.get<OmdbDetail>(BASE_URL, {
      params: { apikey: API_KEY, i: imdbId, plot: 'full' },
      timeout: 5000,
    });
    if (data.Response === 'False') return null;
    return data;
  } catch {
    return null;
  }
}

export async function getOmdbByIds(imdbIds: string[]): Promise<Record<string, OmdbDetail | null>> {
  const results = await Promise.all(imdbIds.map((id) => getOmdbById(id)));
  return imdbIds.reduce<Record<string, OmdbDetail | null>>((acc, id, i) => {
    acc[id] = results[i];
    return acc;
  }, {});
}
