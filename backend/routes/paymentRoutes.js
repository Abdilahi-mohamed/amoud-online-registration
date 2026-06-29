const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getPaymentsByStudentId } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').post(createPayment).get(getPayments);
router.route('/student/:studentId').get(getPaymentsByStudentId);

module.exports = router;
