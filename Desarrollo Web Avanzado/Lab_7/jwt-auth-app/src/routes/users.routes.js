const { Router } = require('express');
const userController = require('../controllers/UserController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, userController.updateMe);

router.get('/', authenticate, authorize(['admin']), userController.getAll);
router.post('/', authenticate, authorize(['admin']), userController.create);
router.get('/:id', authenticate, authorize(['admin']), userController.getById);
router.put('/:id', authenticate, authorize(['admin']), userController.update);
router.delete('/:id', authenticate, authorize(['admin']), userController.remove);

module.exports = router;
