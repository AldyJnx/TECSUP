const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const pool = require('./db');
const { uploadImage, deleteImage } = require('./cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer en memoria: el archivo se envia directo a Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// LISTAR (con foto) - soporta busqueda por apellido con ?apellido=
app.get('/api/contactos', async (req, res) => {
  try {
    const { apellido } = req.query;
    let rows;
    if (apellido) {
      [rows] = await pool.query(
        'SELECT * FROM contactos WHERE apellidos LIKE ? ORDER BY apellidos, nombre',
        [`%${apellido}%`]
      );
    } else {
      [rows] = await pool.query(
        'SELECT * FROM contactos ORDER BY creado_en DESC'
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar contactos' });
  }
});

// OBTENER uno
app.get('/api/contactos/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contactos WHERE id = ?', [
      req.params.id
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: 'Contacto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener contacto' });
  }
});

// CREAR
app.post('/api/contactos', upload.single('foto'), async (req, res) => {
  try {
    const { nombre, apellidos, correo, fecha_nac } = req.body;
    if (!nombre || !apellidos || !correo) {
      return res
        .status(400)
        .json({ error: 'nombre, apellidos y correo son obligatorios' });
    }

    let foto_url = null;
    let foto_public_id = null;
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      foto_url = result.secure_url;
      foto_public_id = result.public_id;
    }

    const [r] = await pool.query(
      `INSERT INTO contactos (nombre, apellidos, correo, fecha_nac, foto_url, foto_public_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellidos, correo, fecha_nac || null, foto_url, foto_public_id]
    );

    const [rows] = await pool.query('SELECT * FROM contactos WHERE id = ?', [
      r.insertId
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear contacto' });
  }
});

// MODIFICAR
app.put('/api/contactos/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, correo, fecha_nac } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM contactos WHERE id = ?',
      [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ error: 'Contacto no encontrado' });

    let foto_url = existing[0].foto_url;
    let foto_public_id = existing[0].foto_public_id;

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      // Borra la foto anterior si existia
      if (foto_public_id) await deleteImage(foto_public_id);
      foto_url = result.secure_url;
      foto_public_id = result.public_id;
    }

    await pool.query(
      `UPDATE contactos
         SET nombre = ?, apellidos = ?, correo = ?, fecha_nac = ?, foto_url = ?, foto_public_id = ?
       WHERE id = ?`,
      [
        nombre ?? existing[0].nombre,
        apellidos ?? existing[0].apellidos,
        correo ?? existing[0].correo,
        fecha_nac || existing[0].fecha_nac,
        foto_url,
        foto_public_id,
        id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM contactos WHERE id = ?', [
      id
    ]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al modificar contacto' });
  }
});

// ELIMINAR
app.delete('/api/contactos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
      'SELECT * FROM contactos WHERE id = ?',
      [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ error: 'Contacto no encontrado' });

    if (existing[0].foto_public_id) {
      await deleteImage(existing[0].foto_public_id);
    }

    await pool.query('DELETE FROM contactos WHERE id = ?', [id]);
    res.json({ ok: true, id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar contacto' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
