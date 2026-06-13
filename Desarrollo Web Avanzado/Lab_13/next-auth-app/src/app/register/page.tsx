'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Error al registrar');
      setLoading(false);
      return;
    }

    // Registro correcto: iniciamos sesion automaticamente.
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      router.push('/signIn');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl text-gray-800 font-bold mb-6 text-center">
          Crear cuenta
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 text-sm rounded p-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-300 text-gray-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 text-gray-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="password"
            placeholder="Contrasena (min. 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 text-gray-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-black transition disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Ya tienes cuenta?{' '}
          <Link href="/signIn" className="text-blue-600 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
