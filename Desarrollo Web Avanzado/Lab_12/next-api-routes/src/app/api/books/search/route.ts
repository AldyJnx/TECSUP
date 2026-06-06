import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Campos permitidos para ordenar
const SORTABLE_FIELDS = ['title', 'publishedYear', 'createdAt'] as const

// GET - Busqueda de libros con filtros y paginacion
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''
    const authorName = searchParams.get('authorName') || ''

    // Paginacion
    let page = parseInt(searchParams.get('page') || '1')
    let limit = parseInt(searchParams.get('limit') || '10')
    if (isNaN(page) || page < 1) page = 1
    if (isNaN(limit) || limit < 1) limit = 10
    if (limit > 50) limit = 50

    // Ordenamiento
    let sortBy = searchParams.get('sortBy') || 'createdAt'
    if (!(SORTABLE_FIELDS as readonly string[]).includes(sortBy))
      sortBy = 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    // Construir filtro WHERE
    const where: Prisma.BookWhereInput = {
      ...(search && {
        title: { contains: search, mode: 'insensitive' },
      }),
      ...(genre && { genre }),
      ...(authorName && {
        author: { name: { contains: authorName, mode: 'insensitive' } },
      }),
    }

    // Total de resultados (para la paginacion)
    const total = await prisma.book.count({ where })
    const totalPages = Math.ceil(total / limit)

    // Obtener la pagina solicitada
    const data = await prisma.book.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}
