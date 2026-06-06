'use client'

import { useCallback, useEffect, useState } from 'react'
import { Author, Book, Pagination } from '@/lib/types'
import BookCover from '@/components/BookCover'
import ImageUpload from '@/components/ImageUpload'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

interface BookForm {
  title: string
  description: string
  isbn: string
  publishedYear: string
  genre: string
  pages: string
  coverUrl: string
  authorId: string
}

const emptyForm: BookForm = {
  title: '',
  description: '',
  isbn: '',
  publishedYear: '',
  genre: '',
  pages: '',
  coverUrl: '',
  authorId: '',
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])

  // Filtros
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const limit = 6

  // Formulario crear/editar
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BookForm>(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Carga inicial de autores y generos
  const loadMeta = useCallback(async () => {
    const [aRes, bRes] = await Promise.all([
      fetch('/api/authors'),
      fetch('/api/books'),
    ])
    const aData = await aRes.json()
    const bData = await bRes.json()
    setAuthors(Array.isArray(aData) ? aData : [])
    const uniqueGenres = [
      ...new Set(
        (Array.isArray(bData) ? bData : [])
          .map((b: Book) => b.genre)
          .filter((g: string | null): g is string => !!g)
      ),
    ].sort()
    setGenres(uniqueGenres)
  }, [])

  // Debounce de la barra de busqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Busqueda con filtros + paginacion
  const loadBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        order,
      })
      if (search) params.set('search', search)
      if (genre) params.set('genre', genre)
      if (authorName) params.set('authorName', authorName)

      const res = await fetch(`/api/books/search?${params.toString()}`)
      const data = await res.json()
      setBooks(data.data ?? [])
      setPagination(data.pagination ?? null)
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, order, search, genre, authorName])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial intencional
    loadMeta()
  }, [loadMeta])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busqueda reactiva intencional
    loadBooks()
  }, [loadBooks])

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (b: Book) => {
    setForm({
      title: b.title,
      description: b.description ?? '',
      isbn: b.isbn ?? '',
      publishedYear: b.publishedYear ? String(b.publishedYear) : '',
      genre: b.genre ?? '',
      pages: b.pages ? String(b.pages) : '',
      coverUrl: b.coverUrl ?? '',
      authorId: b.authorId,
    })
    setEditingId(b.id)
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = editingId ? `/api/books/${editingId}` : '/api/books'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          isbn: form.isbn || null,
          publishedYear: form.publishedYear || null,
          genre: form.genre || null,
          pages: form.pages || null,
          coverUrl: form.coverUrl || null,
          authorId: form.authorId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }
      setShowForm(false)
      await Promise.all([loadBooks(), loadMeta()])
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (b: Book) => {
    if (!confirm(`Eliminar el libro "${b.title}"?`)) return
    const res = await fetch(`/api/books/${b.id}`, { method: 'DELETE' })
    if (res.ok) await Promise.all([loadBooks(), loadMeta()])
    else alert('No se pudo eliminar el libro')
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setGenre('')
    setAuthorName('')
    setSortBy('createdAt')
    setOrder('desc')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Libros</h1>
          <p className="text-slate-500">
            Busca, filtra y administra los libros de la biblioteca.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow transition hover:bg-blue-700"
        >
          + Nuevo libro
        </button>
      </div>

      {/* Barra de filtros */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          placeholder="Buscar por título..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={inputClass}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value)
              setPage(1)
            }}
            className={inputClass}
          >
            <option value="">Todos los géneros</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={authorName}
            onChange={(e) => {
              setAuthorName(e.target.value)
              setPage(1)
            }}
            className={inputClass}
          >
            <option value="">Todos los autores</option>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            className={inputClass}
          >
            <option value="createdAt">Ordenar: Fecha de creación</option>
            <option value="title">Ordenar: Título</option>
            <option value="publishedYear">Ordenar: Año de publicación</option>
          </select>

          <select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value)
              setPage(1)
            }}
            className={inputClass}
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {pagination ? `${pagination.total} resultado(s) encontrados` : ''}
          </span>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
          Buscando libros...
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
          No se encontraron libros con esos criterios.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <div
              key={b.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <BookCover
                title={b.title}
                src={b.coverUrl}
                className="h-40 w-full"
              />
              <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{b.title}</h3>
                  {b.genre && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {b.genre}
                    </span>
                  )}
                </div>
                {b.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                    {b.description}
                  </p>
                )}
                <dl className="space-y-1 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Autor</dt>
                    <dd className="font-medium">{b.author?.name ?? '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Año</dt>
                    <dd>{b.publishedYear ?? '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Páginas</dt>
                    <dd>{b.pages ?? '-'}</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="flex-1 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginacion */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {editingId ? 'Editar libro' : 'Nuevo libro'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Título *">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Autor *">
                <select
                  required
                  value={form.authorId}
                  onChange={(e) =>
                    setForm({ ...form, authorId: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Selecciona un autor</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <ImageUpload
                label="Portada del libro"
                shape="cover"
                value={form.coverUrl}
                onChange={(v) => setForm({ ...form, coverUrl: v })}
              />
              <Field label="Descripción">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Género">
                  <input
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="ISBN">
                  <input
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Año de publicación">
                  <input
                    type="number"
                    value={form.publishedYear}
                    onChange={(e) =>
                      setForm({ ...form, publishedYear: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Páginas">
                  <input
                    type="number"
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  )
}
