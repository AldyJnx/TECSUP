import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface FormState {
  name: string;
  description: string;
  price: number;
  stock: number;
}

const empty: FormState = { name: '', description: '', price: 0, stock: 0 };

export default function Products() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api('/products');
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (editingId) {
        await api(`/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  }

  function edit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: Number(p.price),
      stock: p.stock,
    });
  }

  async function remove(id: number) {
    if (!window.confirm('Eliminar producto?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  function cancel() {
    setEditingId(null);
    setForm(empty);
  }

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <div className="nav">
        <strong>Lab 7 - Productos</strong>
        <div className="row">
          <span>{user?.username}</span>
          <button onClick={onLogout}>Salir</button>
        </div>
      </div>
      <div className="container">
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Descripcion</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Precio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="row">
              <button className="primary" type="submit">
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              {editingId && (
                <button type="button" onClick={cancel}>
                  Cancelar
                </button>
              )}
            </div>
            {error && <p className="error">{error}</p>}
          </form>
        </div>

        <div className="card">
          <h3>Listado</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <div>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: 12, color: '#777' }}>{p.description}</div>
                    )}
                  </td>
                  <td>{Number(p.price).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div className="row">
                      <button onClick={() => edit(p)}>Editar</button>
                      <button className="danger" onClick={() => remove(p.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 16, color: '#777' }}>
                    Sin productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
