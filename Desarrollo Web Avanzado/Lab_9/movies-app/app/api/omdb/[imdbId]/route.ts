import { NextResponse } from 'next/server'
import { getOmdbById } from '@/app/lib/omdb'

export async function GET(
  _req: Request,
  context: { params: Promise<{ imdbId: string }> }
) {
  const { imdbId } = await context.params

  if (!imdbId) {
    return NextResponse.json({ error: 'imdbId requerido' }, { status: 400 })
  }

  const detail = await getOmdbById(imdbId)

  if (!detail) {
    return NextResponse.json(
      { error: 'No se encontró información (verifica tu API key)' },
      { status: 404 }
    )
  }

  return NextResponse.json(detail, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
