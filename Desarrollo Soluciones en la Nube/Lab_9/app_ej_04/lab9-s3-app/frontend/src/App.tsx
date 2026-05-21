import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

interface ImageItem {
  key: string;
  size: number;
  lastModified: string | null;
  url: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'info'; text: string }
  | { kind: 'success'; text: string }
  | { kind: 'error'; text: string };

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchImages = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API_URL}/api/images`);
      if (!res.ok) throw new Error('No se pudieron cargar las imágenes.');
      const data: ImageItem[] = await res.json();
      setImages(data);
    } catch (err) {
      setStatus({ kind: 'error', text: (err as Error).message });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      alert('Tipo de archivo no permitido. Solo JPG, PNG o WEBP.');
      e.target.value = '';
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE) {
      alert('El archivo supera los 5 MB.');
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(selected);
    setStatus({ kind: 'idle' });
  };

  const onUpload = async () => {
    if (!file) {
      alert('Selecciona un archivo primero.');
      return;
    }
    setUploading(true);
    setStatus({ kind: 'info', text: 'Generando enlace de subida...' });
    try {
      // 1) Pedir presigned URL al backend.
      const urlRes = await fetch(`${API_URL}/api/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!urlRes.ok) {
        const body = await urlRes.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo obtener el enlace de subida.');
      }
      const { uploadUrl } = (await urlRes.json()) as { uploadUrl: string; key: string };

      // 2) PUT directo a S3 con el archivo binario.
      // Incluimos x-amz-server-side-encryption porque el backend lo firmó en la URL:
      // si el header no llega exacto, S3 rechaza la subida con SignatureDoesNotMatch.
      setStatus({ kind: 'info', text: 'Subiendo a S3...' });
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-amz-server-side-encryption': 'AES256',
        },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`S3 rechazó la subida (HTTP ${putRes.status}).`);
      }

      setStatus({ kind: 'success', text: `Subida correcta: ${file.name}` });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchImages();
    } catch (err) {
      setStatus({ kind: 'error', text: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (key: string) => {
    if (!window.confirm('¿Eliminar esta imagen del bucket?')) return;
    try {
      const res = await fetch(`${API_URL}/api/images/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo eliminar la imagen.');
      }
      setStatus({ kind: 'success', text: 'Imagen eliminada.' });
      await fetchImages();
    } catch (err) {
      setStatus({ kind: 'error', text: (err as Error).message });
    }
  };

  const statusClass = useMemo(() => {
    if (status.kind === 'idle') return '';
    return `status status--${status.kind}`;
  }, [status]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Galería S3 — Lab 9</h1>
        <p className="app__subtitle">
          Subidas y visualizaciones via presigned URLs. El bucket permanece privado.
        </p>
      </header>

      <section className="card">
        <h2>Subir imagen</h2>
        <div className="upload-row">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            disabled={uploading}
          />
          <button
            className="btn btn--primary"
            onClick={onUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
        {file && (
          <p className="hint">
            Archivo: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB,{' '}
            {file.type})
          </p>
        )}
        {status.kind !== 'idle' && <p className={statusClass}>{status.text}</p>}
      </section>

      <section className="card">
        <div className="gallery__header">
          <h2>Galería</h2>
          <button className="btn" onClick={fetchImages} disabled={loadingList}>
            {loadingList ? 'Cargando...' : 'Recargar'}
          </button>
        </div>

        {images.length === 0 && !loadingList && (
          <p className="hint">No hay imágenes en el bucket todavía.</p>
        )}

        <div className="grid">
          {images.map((img) => {
            const filename = img.key.split('/').pop() ?? img.key;
            return (
              <article key={img.key} className="image-card">
                <div className="image-card__media">
                  <img src={img.url} alt={filename} loading="lazy" />
                </div>
                <div className="image-card__body">
                  <p className="image-card__name" title={filename}>
                    {filename}
                  </p>
                  <p className="image-card__meta">{(img.size / 1024).toFixed(1)} KB</p>
                  <button
                    className="btn btn--danger"
                    onClick={() => onDelete(img.key)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;
