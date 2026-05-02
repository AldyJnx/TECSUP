const { Router } = require('express');

const router = Router();

router.get('/', (_req, res) => res.redirect('/signIn'));
router.get('/signIn', (_req, res) => res.render('signin', { title: 'Iniciar sesion' }));
router.get('/signUp', (_req, res) => res.render('signup', { title: 'Crear cuenta' }));
router.get('/profile', (_req, res) => res.render('profile', { title: 'Mi cuenta' }));
router.get('/dashboard', (_req, res) => res.render('dashboard-user', { title: 'Panel del usuario' }));
router.get('/admin', (_req, res) => res.render('dashboard-admin', { title: 'Panel del administrador' }));
router.get('/admin/users/new', (_req, res) => res.render('user-new', { title: 'Nuevo usuario' }));
router.get('/admin/users/:id', (req, res) => res.render('user-detail', { title: 'Detalle de usuario', userId: req.params.id }));
router.get('/403', (_req, res) => res.status(403).render('403', { title: 'Acceso denegado' }));

module.exports = router;
