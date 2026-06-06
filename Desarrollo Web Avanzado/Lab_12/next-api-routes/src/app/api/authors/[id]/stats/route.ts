import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Estadisticas completas de un autor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el autor existe y traer sus libros
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    const books = author.books

    // Si no tiene libros, devolver estadisticas vacias
    if (books.length === 0) {
      return NextResponse.json({
        authorId: author.id,
        authorName: author.name,
        totalBooks: 0,
        firstBook: null,
        latestBook: null,
        averagePages: 0,
        genres: [],
        longestBook: null,
        shortestBook: null,
      })
    }

    // Libros con anio de publicacion (para primero/ultimo)
    const withYear = books.filter((b) => b.publishedYear != null)
    const sortedByYear = [...withYear].sort(
      (a, b) => (a.publishedYear ?? 0) - (b.publishedYear ?? 0)
    )
    const firstBook = sortedByYear[0]
      ? { title: sortedByYear[0].title, year: sortedByYear[0].publishedYear }
      : null
    const latestBook = sortedByYear[sortedByYear.length - 1]
      ? {
          title: sortedByYear[sortedByYear.length - 1].title,
          year: sortedByYear[sortedByYear.length - 1].publishedYear,
        }
      : null

    // Promedio de paginas (solo libros con paginas)
    const withPages = books.filter((b) => b.pages != null)
    const averagePages =
      withPages.length > 0
        ? Math.round(
            withPages.reduce((sum, b) => sum + (b.pages ?? 0), 0) /
              withPages.length
          )
        : 0

    // Generos unicos
    const genres = [
      ...new Set(
        books.map((b) => b.genre).filter((g): g is string => g != null)
      ),
    ]

    // Libro con mas y menos paginas
    const sortedByPages = [...withPages].sort(
      (a, b) => (a.pages ?? 0) - (b.pages ?? 0)
    )
    const shortestBook = sortedByPages[0]
      ? { title: sortedByPages[0].title, pages: sortedByPages[0].pages }
      : null
    const longestBook = sortedByPages[sortedByPages.length - 1]
      ? {
          title: sortedByPages[sortedByPages.length - 1].title,
          pages: sortedByPages[sortedByPages.length - 1].pages,
        }
      : null

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks: books.length,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook,
      shortestBook,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del autor' },
      { status: 500 }
    )
  }
}
