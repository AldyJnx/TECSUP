# Cinemax

App de películas y series con Next.js 16 (App Router) + Tailwind v4.
Diseño dark mode inspirado en Netflix / Prime Video.

## Instalación

```bash
npm install
cp .env.local.example .env.local
# edita .env.local y pon tu API key de OMDb
npm run dev
```

API key gratis: https://www.omdbapi.com/apikey.aspx

## Estructura

- `/` (SSR) — Home con hero + filas de pósters por categoría.
- `/search` (CSR) — búsqueda interactiva en tiempo real.
- `/api/omdb/[imdbId]` — proxy server-side a OMDb (oculta la API key).
- `/api/omdb/search?q=...` — endpoint de búsqueda.

## Justificación SSR vs CSR

| Vista | Estrategia | Por qué |
|-------|-----------|---------|
| Home | SSR | SEO, contenido "frío" (lista curada), primera carga rápida con HTML ya renderizado. |
| Hero meta (rating, año, plot) | SSR | Datos llegan ya en el HTML, sin spinner. |
| Búsqueda | CSR | Necesita reaccionar al teclado en tiempo real con `useState` + `useEffect` + debounce; no recarga página. |
| Modal de detalle | CSR | Se abre on-demand; fetch a OMDb solo si el usuario hace click. |
| Hover-preview de trailer | CSR | Interacción puramente cliente con `useRef` sobre `<video>`. |
| Navbar scroll-aware | CSR | Escucha eventos de scroll del navegador. |

## Assets que debes proveer

Las series ya están definidas en [app/lib/series.ts](app/lib/series.ts).
Para cada slug coloca tu póster, backdrop y trailer en `/public`:

```
public/
├─ images/
│  ├─ stranger-things-poster.jpg      (vertical, 2:3)
│  ├─ stranger-things-backdrop.jpg    (horizontal, 16:9)
│  ├─ wednesday-poster.jpg
│  ├─ wednesday-backdrop.jpg
│  └─ ... (uno por cada slug)
└─ trailers/
   ├─ stranger-things.mp4              (MP4 H.264, sin audio recomendado)
   ├─ wednesday.mp4
   └─ ... (uno por cada slug)
```

### Slugs esperados

```
stranger-things, wednesday, the-last-of-us, house-of-the-dragon,
squid-game, the-bear, dark, breaking-bad, game-of-thrones,
better-call-saul, peaky-blinders, money-heist, the-crown,
oppenheimer, barbie, spider-verse, dune-2, dune, everything-everywhere
```

Si falta una imagen, la card muestra un degradado dark. Si falta un trailer,
el hover-preview simplemente no aparece y se queda con el póster.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- TypeScript
- Axios (peticiones a OMDb)
- Fuente: Inter (Google Fonts via next/font)

## Design system

- **Estilo:** Dark Mode (OLED) — WCAG AAA
- **Background:** #000000
- **Accent (CTA):** #E11D48
- **Cards:** #181818
- **Border:** #312E81

Tokens en [app/globals.css](app/globals.css). Skill UI/UX usada para
generar las recomendaciones: ui-ux-pro-max.
