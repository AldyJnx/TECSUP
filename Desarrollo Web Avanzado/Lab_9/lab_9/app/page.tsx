import Link from 'next/link'

const links = [
  {
    href: '/pokemon-csr',
    title: 'Pokémon CSR',
    desc: 'Client-Side Rendering: los datos se cargan en el navegador.',
    color: 'from-blue-500 to-purple-600',
  },
  {
    href: '/pokemon-ssr',
    title: 'Pokémon SSR',
    desc: 'Server-Side Rendering: el HTML llega ya renderizado.',
    color: 'from-green-500 to-teal-600',
  },
  {
    href: '/weather',
    title: 'Dashboard del Clima',
    desc: 'Dashboard híbrido SSR + CSR (Lima fijo + ciudad interactiva).',
    color: 'from-sky-400 via-blue-500 to-indigo-600',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            Lab 09 - Introducción a Next.js
          </h1>
          <p className="mt-3 text-slate-300">Selecciona un ejercicio</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`bg-gradient-to-br ${l.color} rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform border-4 border-white/20`}
            >
              <h2 className="text-2xl font-bold mb-2">{l.title}</h2>
              <p className="text-sm text-white/90">{l.desc}</p>
              <p className="mt-4 text-xs font-mono opacity-80">{l.href}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
