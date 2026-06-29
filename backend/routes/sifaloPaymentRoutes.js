const express = require('express');
const router = express.Router();
const { 
    initializeSifaloPayment, 
    handleSifaloWebhook, 
    verifySifaloPayment 
} = require('../controllers/sifaloPaymentController');
const { protect } = require('../middleware/authMiddleware');

// Public webhook callback from Sifalo Pay gateway
router.post('/callback', handleSifaloWebhook);

// Protected student portal endpoints
router.post('/initialize', protect, initializeSifaloPayment);
router.get('/verify/:transaction_id', protect, verifySifaloPayment);

module.exports = router;
