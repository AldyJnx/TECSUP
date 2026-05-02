const { Router } = require('express');
const authController = require('../controllers/AuthController');

const router = Router();

router.post('/signUp', authController.signUp);
router.post('/signIn', authController.signIn);

module.exports = router;
