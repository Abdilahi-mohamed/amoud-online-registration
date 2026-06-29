const express = require('express');
const router = express.Router();
const { validateSecondaryLogin } = require('../controllers/secondaryAuthController');

router.post('/validate', validateSecondaryLogin);

module.exports = router;
