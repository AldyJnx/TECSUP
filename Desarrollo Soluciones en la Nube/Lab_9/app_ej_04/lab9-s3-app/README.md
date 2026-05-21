# Lab 9 — Galería S3 con Presigned URLs

Aplicación full-stack para el curso **Desarrollo de Soluciones en la Nube**. Implementa una galería de imágenes contra un bucket **AWS S3 privado**: el navegador nunca recibe credenciales AWS — el backend (NestJS) genera **presigned URLs** temporales tanto para subir (PUT) como para visualizar (GET) los objetos, y el frontend (React + Vite) sólo conversa con esas URLs.

## Arquitectura

```
+----------------+           +-----------------+           +------------------+
|   Navegador    |           |  Backend NestJS |           |   AWS S3         |
|  (React/Vite)  |           |   (Node 18+)    |           |  bucket privado  |
+----------------+           +-----------------+           +------------------+
        |                            |                              |
        | (1) POST /api/upload-url   |                              |
        |--------------------------->|                              |
        |                            | sign PutObject (SDK v3)      |
        |                            |----------------------------> |
        |  { uploadUrl, key }        |                              |
        |<---------------------------|                              |
        |                                                           |
        | (2) PUT uploadUrl (binario, Content-Type)                 |
        |---------------------------------------------------------->|
        |                                                           |
        | (3) GET /api/images        |                              |
        |--------------------------->| ListObjectsV2 + sign GETs    |
        |                            |<---------------------------->|
        |  [{ key, size, url }, ...] |                              |
        |<---------------------------|                              |
```

- El bucket **nunca** se vuelve público.
- Las credenciales AWS viven sólo en el backend (`.env`).
- El frontend hace `fetch` al backend y `fetch` directo a S3 (con las URLs firmadas).

## Requisitos previos

- **Node.js 18+** y **npm**.
- Cuenta de AWS con un **bucket S3 privado** (sugerido: `lab-imagenes-montoya-today`).
- **Usuario IAM** con una política mínima sobre ese bucket:
  - `s3:PutObject`
  - `s3:GetObject`
  - `s3:ListBucket`
  - `s3:DeleteObject`
- **CORS del bucket** configurado (ver siguiente sección).

## Configuración CORS del bucket S3

Pega este JSON en la consola de S3 → tu bucket → pestaña **Permissions** → sección **Cross-origin resource sharing (CORS)**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Si vas a desplegar el frontend en otro origen, agrégalo a `AllowedOrigins`.

## Variables de entorno

### `backend/.env`

Copia `backend/.env.example` y completa los valores:

```
AWS_REGION=us-east-1
S3_BUCKET=lab-imagenes-montoya-today
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
PORT=3000
ALLOWED_ORIGIN=http://localhost:5173
```

### `frontend/.env` (opcional)

Por defecto el frontend apunta a `http://localhost:3000`. Si necesitas cambiarlo:

```
VITE_API_URL=http://localhost:3000
```

> El archivo `.env` está ignorado por git. **Nunca** subas tus claves AWS al repositorio.

## Pasos para correr el backend

```bash
cd backend
npm install
# crea backend/.env con tus valores reales
npm run start:dev
```

El backend queda en `http://localhost:3000` con los endpoints:

- `POST /api/upload-url` — body `{ filename, contentType, sizeBytes }` → `{ uploadUrl, key }`
- `GET  /api/images` — lista la galería con presigned GETs
- `DELETE /api/images/:key(*)` — elimina un objeto bajo `originales/`

## Pasos para correr el frontend

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Pruebas a documentar

Checklist para la evidencia del laboratorio:

- [ ] Subir un JPG válido (debería aparecer en la galería).
- [ ] Intentar subir un archivo `.exe` (debe ser rechazado por el frontend antes de salir).
- [ ] Intentar subir un archivo de 10 MB (debe ser rechazado por el backend, código 400).
- [ ] Esperar 16 minutos y refrescar: las imágenes deberían fallar al cargar (la presigned GET expira a los 15 min).
- [ ] Abrir DevTools → Application/Sources: **no** debe aparecer `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, ni el SDK de AWS en el bundle del frontend.
- [ ] Network tab: confirmar que el **PUT** del archivo va directo al host de S3 (`*.amazonaws.com`), **no** al backend.

## Limpieza al terminar

1. **Vacía el bucket** desde la consola AWS (o `aws s3 rm s3://<bucket>/originales/ --recursive`).
2. **Rota o elimina las access keys** del usuario IAM usadas en el lab.
3. **Borra el bucket** si ya no lo necesitas.
4. **Borra el archivo `.env` local** o al menos las claves que contiene.

## Reglas de seguridad respetadas

- El frontend no contiene credenciales AWS ni el SDK.
- Bucket privado, sin policies públicas.
- Sanitización del nombre de archivo en el backend (`[^a-zA-Z0-9._-]` → `_`) + key prefijada con timestamp + random hex.
- Doble validación (frontend + backend) de tipo MIME y tamaño.
- Cifrado en reposo: `ServerSideEncryption: AES256` en cada `PutObjectCommand`.
- TTL corto de las presigned URLs: 5 min PUT, 15 min GET.
- Los errores del SDK no se propagan al cliente; se wrappean en mensajes amigables.
