require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const viewsRoutes = require('./routes/views.routes');
const seedRoles = require('./utils/seedRoles');
const seedUsers = require('./utils/seedUsers');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', viewsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Recurso no encontrado' });
  }
  res.status(404).render('404', { title: 'Pagina no encontrada' });
});

app.use((err, req, res, _next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ message: err.message || 'Error interno' });
  }
  res.status(status).render('404', { title: 'Error', message: err.message });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth_db';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('[db] Conectado a MongoDB');
    await seedRoles();
    await seedUsers();
    app.listen(PORT, () => {
      console.log(`[server] Escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[db] Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });
