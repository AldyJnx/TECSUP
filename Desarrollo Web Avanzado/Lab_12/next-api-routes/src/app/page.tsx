'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Author } from '@/lib/types'
import Avatar from '@/components/Avatar'
import ImageUpload from '@/components/ImageUpload'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

interface AuthorForm {
  name: string
  email: string
  bio: string
  nationality: string
  birthYear: string
  photoUrl: string
}

const emptyForm: AuthorForm = {
  name: '',
  email: '',
  bio: '',
  nationality: '',
  birthYear: '',
  photoUrl: '',
}

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AuthorForm>(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadAuthors = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/authors')
      const data = await res.json()
      setAuthors(Array.isArray(data) ? data : [])
    } catch {
      setError('No se pudieron cargar los autores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial intencional
    loadAuthors()
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (a: Author) => {
    setForm({
      name: a.name,
      email: a.email,
      bio: a.bio ?? '',
      nationality: a.nationality ?? '',
      birthYear: a.birthYear ? String(a.birthYear) : '',
      photoUrl: a.photoUrl ?? '',
    })
    setEditingId(a.id)
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = editingId ? `/api/authors/${editingId}` : '/api/authors'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          bio: form.bio || null,
          nationality: form.nationality || null,
          birthYear: form.birthYear || null,
          photoUrl: form.photoUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }
      setShowForm(false)
      await loadAuthors()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (a: Author) => {
    if (!confirm(`Eliminar al autor "${a.name}" y todos sus libros?`)) return
    const res = await fetch(`/api/authors/${a.id}`, { method: 'DELETE' })
    if (res.ok) await loadAuthors()
    else alert('No se pudo eliminar el autor')
  }

  const totalBooks = authors.reduce((sum, a) => sum + (a._count?.books ?? 0), 0)
  const totalNationalities = new Set(
    authors.map((a) => a.nationality).filter(Boolean)
  ).size

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel de Autores</h1>
          <p className="text-slate-500">
            Gestiona los autores y sus libros de la biblioteca.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow transition hover:bg-blue-700"
        >
          + Nuevo autor
        </button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Autores" value={authors.length} color="bg-blue-500" />
        <StatCard
          label="Libros totales"
          value={totalBooks}
          color="bg-emerald-500"
        />
        <StatCard
          label="Nacionalidades"
          value={totalNationalities}
          color="bg-amber-500"
        />
      </div>

      {/* Lista de autores */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-800">Autores registrados</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">
            Cargando autores...
          </div>
        ) : authors.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No hay autores todavía. Crea el primero.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {authors.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={a.name} src={a.photoUrl} size={48} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {a.name}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {a._count?.books ?? 0} libros
                      </span>
                    </div>
                    <p className="truncate text-sm text-slate-500">
                      {a.email}
                      {a.nationality ? ` - ${a.nationality}` : ''}
                      {a.birthYear ? ` - ${a.birthYear}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/authors/${a.id}`}
                    className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white transition hover:bg-slate-700"
                  >
                    Ver detalle
                  </Link>
                  <button
                    onClick={() => openEdit(a)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {editingId ? 'Editar autor' : 'Nuevo autor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <ImageUpload
                label="Foto del autor"
                shape="circle"
                value={form.photoUrl}
                onChange={(v) => setForm({ ...form, photoUrl: v })}
              />
              <Field label="Nombre *">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Email *">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nacionalidad">
                  <input
                    value={form.nationality}
                    onChange={(e) =>
                      setForm({ ...form, nationality: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Año de nacimiento">
                  <input
                    type="number"
                    value={form.birthYear}
                    onChange={(e) =>
                      setForm({ ...form, birthYear: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Biografía">
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className={inputClass}
                />
              </Field>

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

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold text-white ${color}`}
      >
        {value}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
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
