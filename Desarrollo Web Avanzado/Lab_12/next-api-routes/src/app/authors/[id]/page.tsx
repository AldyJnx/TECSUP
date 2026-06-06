'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Author, AuthorStats, Book } from '@/lib/types'
import Avatar from '@/components/Avatar'
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
}

const emptyBook: BookForm = {
  title: '',
  description: '',
  isbn: '',
  publishedYear: '',
  genre: '',
  pages: '',
  coverUrl: '',
}

export default function AuthorDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Editar autor
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: '',
    photoUrl: '',
  })
  const [showEdit, setShowEdit] = useState(false)
  const [savingAuthor, setSavingAuthor] = useState(false)
  const [authorError, setAuthorError] = useState('')

  // Agregar libro
  const [showBook, setShowBook] = useState(false)
  const [bookForm, setBookForm] = useState<BookForm>(emptyBook)
  const [savingBook, setSavingBook] = useState(false)
  const [bookError, setBookError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`/api/authors/${id}`),
        fetch(`/api/authors/${id}/stats`),
      ])
      if (aRes.status === 404) {
        setNotFound(true)
        return
      }
      const aData = await aRes.json()
      const sData = await sRes.json()
      setAuthor(aData)
      setStats(sData)
      setEditForm({
        name: aData.name ?? '',
        email: aData.email ?? '',
        bio: aData.bio ?? '',
        nationality: aData.nationality ?? '',
        birthYear: aData.birthYear ? String(aData.birthYear) : '',
        photoUrl: aData.photoUrl ?? '',
      })
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial intencional
    load()
  }, [load])

  const handleEditAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAuthor(true)
    setAuthorError('')
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          bio: editForm.bio || null,
          nationality: editForm.nationality || null,
          birthYear: editForm.birthYear || null,
          photoUrl: editForm.photoUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthorError(data.error || 'Error al guardar')
        return
      }
      setShowEdit(false)
      await load()
    } catch {
      setAuthorError('Error de conexión')
    } finally {
      setSavingAuthor(false)
    }
  }

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBook(true)
    setBookError('')
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookForm.title,
          description: bookForm.description || null,
          isbn: bookForm.isbn || null,
          publishedYear: bookForm.publishedYear || null,
          genre: bookForm.genre || null,
          pages: bookForm.pages || null,
          coverUrl: bookForm.coverUrl || null,
          authorId: id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBookError(data.error || 'Error al crear el libro')
        return
      }
      setShowBook(false)
      setBookForm(emptyBook)
      await load()
    } catch {
      setBookError('Error de conexión')
    } finally {
      setSavingBook(false)
    }
  }

  const handleDeleteBook = async (b: Book) => {
    if (!confirm(`Eliminar el libro "${b.title}"?`)) return
    const res = await fetch(`/api/books/${b.id}`, { method: 'DELETE' })
    if (res.ok) await load()
    else alert('No se pudo eliminar el libro')
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
        Cargando autor...
      </div>
    )
  }

  if (notFound || !author) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-slate-500">Autor no encontrado.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Volver al panel
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        &larr; Volver al panel
      </Link>

      {/* Informacion del autor */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={author.name} src={author.photoUrl} size={80} />
            <div>
            <h1 className="text-3xl font-bold text-slate-900">{author.name}</h1>
            <p className="mt-1 text-slate-500">{author.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {author.nationality && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {author.nationality}
                </span>
              )}
              {author.birthYear && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Nació en {author.birthYear}
                </span>
              )}
            </div>
            {author.bio && (
              <p className="mt-4 max-w-2xl text-slate-600">{author.bio}</p>
            )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              Editar autor
            </button>
            <button
              onClick={() => setShowBook(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Agregar libro
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">
            Estadísticas del autor
          </h2>
          {stats.totalBooks === 0 ? (
            <p className="text-slate-400">
              Este autor todavía no tiene libros registrados.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Total de libros" value={stats.totalBooks} />
              <Stat label="Promedio de páginas" value={stats.averagePages} />
              <Stat
                label="Primer libro"
                value={stats.firstBook?.year ?? '-'}
                sub={stats.firstBook?.title}
              />
              <Stat
                label="Último libro"
                value={stats.latestBook?.year ?? '-'}
                sub={stats.latestBook?.title}
              />
              <Stat
                label="Libro más largo"
                value={`${stats.longestBook?.pages ?? '-'} p.`}
                sub={stats.longestBook?.title}
              />
              <Stat
                label="Libro más corto"
                value={`${stats.shortestBook?.pages ?? '-'} p.`}
                sub={stats.shortestBook?.title}
              />
              <div className="col-span-2 rounded-lg bg-slate-50 p-4 lg:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Géneros
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stats.genres.length > 0 ? (
                    stats.genres.map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de libros */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-800">
            Libros ({author.books?.length ?? 0})
          </h2>
        </div>
        {!author.books || author.books.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Este autor no tiene libros. Agrega el primero.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {author.books.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <BookCover
                    title={b.title}
                    src={b.coverUrl}
                    className="h-16 w-12 shrink-0 rounded-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {b.title}
                      </span>
                      {b.genre && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                          {b.genre}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {b.publishedYear ? `Año ${b.publishedYear}` : 'Sin año'}
                      {b.pages ? ` - ${b.pages} páginas` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBook(b)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal editar autor */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Editar autor
            </h3>
            <form onSubmit={handleEditAuthor} className="space-y-3">
              <ImageUpload
                label="Foto del autor"
                shape="circle"
                value={editForm.photoUrl}
                onChange={(v) => setEditForm({ ...editForm, photoUrl: v })}
              />
              <Field label="Nombre *">
                <input
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Email *">
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nacionalidad">
                  <input
                    value={editForm.nationality}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nationality: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Año de nacimiento">
                  <input
                    type="number"
                    value={editForm.birthYear}
                    onChange={(e) =>
                      setEditForm({ ...editForm, birthYear: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Biografía">
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              {authorError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {authorError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAuthor}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingAuthor ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal agregar libro */}
      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Agregar libro a {author.name}
            </h3>
            <form onSubmit={handleAddBook} className="space-y-3">
              <ImageUpload
                label="Portada del libro"
                shape="cover"
                value={bookForm.coverUrl}
                onChange={(v) => setBookForm({ ...bookForm, coverUrl: v })}
              />
              <Field label="Título *">
                <input
                  required
                  value={bookForm.title}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, title: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  rows={2}
                  value={bookForm.description}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, description: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Género">
                  <input
                    value={bookForm.genre}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, genre: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="ISBN">
                  <input
                    value={bookForm.isbn}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, isbn: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Año de publicación">
                  <input
                    type="number"
                    value={bookForm.publishedYear}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, publishedYear: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Páginas">
                  <input
                    type="number"
                    value={bookForm.pages}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, pages: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              {bookError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {bookError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBook(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingBook}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingBook ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      {sub && <p className="truncate text-xs text-slate-500">{sub}</p>}
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
