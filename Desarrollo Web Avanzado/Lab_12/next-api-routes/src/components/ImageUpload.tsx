'use client'

import { useRef, useState } from 'react'
import { fileToCompressedDataUrl } from '@/lib/image'

interface ImageUploadProps {
  value: string
  onChange: (dataUrl: string) => void
  label?: string
  shape?: 'circle' | 'cover'
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Imagen',
  shape = 'cover',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setErr('')
    setLoading(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      onChange(dataUrl)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  const previewClasses =
    shape === 'circle'
      ? 'h-20 w-20 rounded-full'
      : 'h-28 w-20 rounded-lg'

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-100 ${previewClasses}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">Sin imagen</span>
          )}
        </div>
        <div className="space-y-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {loading ? 'Procesando...' : value ? 'Cambiar' : 'Subir imagen'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
              >
                Quitar
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">JPG o PNG, se optimiza sola.</p>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  )
}
