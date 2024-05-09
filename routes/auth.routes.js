const express = require('express');
const router = express.Router();
const { register, login, authenticate } = require('../controllers/auth.controllers');
const restricted = require('../middleware/restricted');

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/authenticate', restricted, authenticate);

module.exports = router;
