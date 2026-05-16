import { NextResponse } from 'next/server'
import { searchOmdb } from '@/app/lib/omdb'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim() ?? ''

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const results = await searchOmdb(query)

  return NextResponse.json(
    { results },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  )
}
