const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('./authController'); // FIXED: Imports auth controller elements cleanly
const { generalApiLimiter } = require('../middlewares/rateLimiter');

// Protect security registration/login screens from rapid clicking brute attacks
router.use(generalApiLimiter);

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
