const Payment = require('../models/Payment');

const createPayment = async (req, res) => {
    try {
        const { studentId, studentName, paymentNumber, amount } = req.body;

        if (!studentId || !studentName || !paymentNumber || !amount) {
            return res.status(400).json({ message: 'All payment fields are required' });
        }

        const payment = await Payment.create({
            user: req.user._id,
            studentId,
            studentName,
            paymentNumber,
            amount
        });

        res.status(201).json({ message: 'Payment recorded', payment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPayments = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const payments = await Payment.find().sort({ date: -1 });
            return res.json(payments);
        }

        const payments = await Payment.find({ user: req.user._id }).sort({ date: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPaymentsByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const payments = await Payment.find({ studentId }).sort({ date: 1 });

        if (!payments.length) return res.status(404).json({ message: 'No payments for this student ID' });

        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createPayment, getPayments, getPaymentsByStudentId };