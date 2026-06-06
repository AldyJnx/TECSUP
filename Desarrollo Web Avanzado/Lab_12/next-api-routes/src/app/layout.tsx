import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Biblioteca | Lab 12",
  description: "Sistema de biblioteca con Next.js, Prisma y Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-sm">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="rounded-md bg-linear-to-br from-blue-500 to-emerald-500 px-2 py-1 text-sm font-bold">
                B
              </span>
              Biblioteca
            </Link>
            <div className="flex gap-1 text-sm font-medium">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                Autores
              </Link>
              <Link
                href="/books"
                className="rounded-md px-3 py-2 text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                Libros
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          Lab 12 - Desarrollo de Aplicaciones Web Avanzado - Aldy Montoya
        </footer>
      </body>
    </html>
  );
}
