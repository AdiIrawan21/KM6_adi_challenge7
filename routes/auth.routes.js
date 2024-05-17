const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');
const restricted = require('../middleware/restricted');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/authenticate', restricted, authController.authenticate);
router.post('/auth/forgotpassword', authController.forgotPassword);
router.post('/auth/resetpassword/:token', authController.resetPassword);

module.exports = router;
