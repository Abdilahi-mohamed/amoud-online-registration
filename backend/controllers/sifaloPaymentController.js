const axios = require('axios');
const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Class = require('../models/Class');

// Helper to send mock SMS confirmation
const sendSMSConfirmation = (phone, studentName, amount, status) => {
    console.log(`[SMS OUTBOX] Sending alert to ${phone}: "Dear ${studentName}, your tuition payment of $${amount} is confirmed. Status: ${status.toUpperCase()}."`);
};

/**
 * @desc    Initialize Sifalo Pay payment (Direct e-Wallet billing or browser checkout)
 * @route   POST /api/payment/initialize
 * @access  Private
 */
const initializeSifaloPayment = async (req, res) => {
    try {
        const { 
            amount, 
            phone, 
            payment_method, 
            studentId, 
            studentName,
            // Pending academic registration fields
            type, // 'fresh' or 'semester'
            semester,
            faculty,
            department,
            year,
            className
        } = req.body;

        if (!amount || !phone || !studentId || !studentName || !payment_method || !type) {
            return res.status(400).json({ message: 'Missing required initialization fields' });
        }

        const reference_id = 'REG' + Date.now();
        const sifaloBaseUrl = process.env.SIFALO_BASE_URL || 'https://api.sifalopay.com';
        const apiKey = process.env.SIFALO_API_KEY || 'your_api_key';
        const secretKey = process.env.SIFALO_SECRET_KEY || 'your_secret_key';

        // Gateway expected values mapping: waafi (EVC, ZAAD, SAHAL), edahab (eDahab), pbwallet (Premier)
        let selectedGateway = 'waafi';
        if (payment_method === 'eDahab') {
            selectedGateway = 'edahab';
        } else if (payment_method === 'pbwallet' || payment_method === 'Premier Wallet') {
            selectedGateway = 'pbwallet';
        }

        const isMobileMoney = ['EVC PLUS', 'ZAAD', 'eDahab', 'SAHAL'].includes(payment_method);
        
        let paymentUrl = '';
        let transactionId = 'TXN' + Math.floor(100000 + Math.random() * 900000);
        let isDirectPrompt = false;
        let paymentStatus = 'pending';
        let sifaloResponseData = null;

        if (isMobileMoney) {
            isDirectPrompt = true; // Bypasses browser redirects, triggers USSD PIN push directly on their phone

            if (apiKey !== 'your_api_key') {
                try {
                    // Base64 encoding credentials for Basic Auth Header: [API_KEY:SECRET_KEY]
                    const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
                    const authHeader = `Basic ${credentials}`;

                    const directResponse = await axios.post(`${sifaloBaseUrl}/gateway/`, {
                        account: phone,
                        gateway: selectedGateway,
                        amount: String(amount),
                        currency: 'USD',
                        order_id: reference_id
                    }, {
                        headers: {
                            'Authorization': authHeader,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('[Sifalo Direct API Response]:', directResponse.data);
                    sifaloResponseData = directResponse.data;

                    if (directResponse.data) {
                        if (directResponse.data.sid) {
                            transactionId = directResponse.data.sid;
                        }

                        // Response codes: 601 (success), 603 (pending approval), 600/604 (failed)
                        const responseCode = String(directResponse.data.code);
                        if (responseCode === '601') {
                            paymentStatus = 'paid';
                        } else if (responseCode === '603') {
                            paymentStatus = 'pending';
                        } else {
                            // If Sifalo returns a failure code (e.g. 600, 604), return the exact Sifalo response error message!
                            return res.status(400).json({ 
                                message: directResponse.data.response || 'Transaction failed. Please try again.',
                                sifaloResponse: directResponse.data 
                            });
                        }
                    } else {
                        return res.status(400).json({ message: 'Sifalo gateway returned empty response.' });
                    }
                } catch (err) {
                    console.error('Sifalo Pay Direct USSD call failed:', err.response?.data || err.message);
                    const errMsg = err.response?.data?.response || err.response?.data?.message || err.message;
                    return res.status(400).json({ 
                        message: `Sifalo Error: ${errMsg}`,
                        sifaloResponse: err.response?.data || null 
                    });
                }
            } else {
                // Staging/Sandbox mock direct billing auto-approver
                paymentStatus = 'paid';
            }
        } else {
            // For Visa/Mastercard, we must use browser redirect checkout URL
            if (apiKey !== 'your_api_key') {
                try {
                    const response = await axios.post(`${sifaloBaseUrl}/payment/create`, {
                        amount: parseFloat(amount),
                        currency: 'USD',
                        description: `Student registration fee - ${studentName}`,
                        customer_name: studentName,
                        customer_phone: phone,
                        reference_id,
                        callback_url: `${req.protocol}://${req.get('host')}/api/payment/callback`,
                        return_url: `${req.protocol}://${req.get('host')}/payment/success`,
                        cancel_url: `${req.protocol}://${req.get('host')}/payment/cancel`
                    }, {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });

                    if (response.data && response.data.payment_url) {
                        paymentUrl = response.data.payment_url;
                        transactionId = response.data.transaction_id || transactionId;
                        sifaloResponseData = response.data;
                    }
                } catch (err) {
                    console.error('Sifalo Pay checkout URL failed:', err.response?.data || err.message);
                    const errMsg = err.response?.data?.message || err.message;
                    return res.status(400).json({ message: `Sifalo Error: ${errMsg}` });
                }
            }

            if (!paymentUrl) {
                paymentUrl = `https://pay.sifalo.com/checkout/mock_${transactionId}`;
            }
        }

        // Save payment record in our database
        const payment = await Payment.create({
            user: req.user._id,
            studentId,
            studentName,
            paymentNumber: reference_id, // old reference_id compatibility
            transaction_id: transactionId,
            amount: parseFloat(amount),
            currency: 'USD',
            payment_method,
            status: paymentStatus,
            phone,
            pendingRegistrationData: {
                type,
                semester: semester ? parseInt(semester, 10) : undefined,
                faculty,
                department,
                year,
                className
            }
        });

        // Trigger asynchronous automatic class completion if payment succeeded immediately
        if (paymentStatus === 'paid') {
            await completeRegistration(payment);
        }

        res.status(200).json({
            status: 'success',
            payment_url: paymentUrl,
            transaction_id: transactionId,
            isDirectPrompt,
            paymentStatus,
            sifaloResponse: sifaloResponseData,
            payment
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc    Sifalo Pay Webhook / Callback handler
 * @route   POST /api/payment/callback
 * @access  Public
 */
const handleSifaloWebhook = async (req, res) => {
    try {
        console.log('[Sifalo Webhook Received]:', req.body);
        const { transaction_id, reference_id, amount, status, payment_method } = req.body;

        // Find pending transaction in DB
        const payment = await Payment.findOne({
            $or: [
                { transaction_id: transaction_id },
                { paymentNumber: reference_id }
            ]
        });

        if (!payment) {
            return res.status(404).json({ message: 'Transaction not found in record ledger' });
        }

        // Prevent duplicate processing
        if (payment.status === 'paid') {
            return res.status(200).json({ message: 'Transaction already paid and completed' });
        }

        payment.status = status === 'paid' ? 'paid' : 'failed';
        if (transaction_id) payment.transaction_id = transaction_id;
        if (payment_method) payment.payment_method = payment_method;
        await payment.save();

        if (payment.status === 'paid') {
            await completeRegistration(payment);
        } else {
            sendSMSConfirmation(payment.phone, payment.studentName, payment.amount, 'failed');
        }

        res.status(200).json({ status: 'success', message: 'Registry transaction updated' });

    } catch (err) {
        console.error('Webhook processing failure:', err.message);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Helper to process academic registration enrollment complete
 */
const completeRegistration = async (payment) => {
    const regData = payment.pendingRegistrationData;
    if (regData && regData.type) {
        if (regData.type === 'semester') {
            const existingReg = await Registration.findOne({
                type: 'semester',
                department: regData.department,
                year: regData.year,
                semester: regData.semester,
                studentId: payment.studentId
            });

            if (!existingReg) {
                await Registration.create({
                    user: payment.user,
                    type: 'semester',
                    semester: regData.semester,
                    department: regData.department,
                    year: regData.year,
                    className: regData.className,
                    studentId: payment.studentId,
                    studentName: payment.studentName,
                    faculty: regData.faculty,
                    registeredBy: 'self'
                });
            }
        } else if (regData.type === 'fresh') {
            const existingReg = await Registration.findOne({ user: payment.user, type: 'fresh' });
            if (!existingReg) {
                const targetClass = await Class.findOne({ semester: regData.semester });
                if (targetClass && targetClass.enrolledCount < targetClass.capacity) {
                    await Class.findByIdAndUpdate(targetClass._id, { $inc: { enrolledCount: 1 } });
                    await Registration.create({
                        user: payment.user,
                        type: 'fresh',
                        semester: regData.semester,
                        class: targetClass._id,
                        registeredBy: 'self'
                    });
                }
            }
        }
    }
    // Fire SMS
    sendSMSConfirmation(payment.phone, payment.studentName, payment.amount, 'paid');
};

/**
 * @desc    Verify current payment status
 * @route   GET /api/payment/verify/:transaction_id
 * @access  Private
 */
const verifySifaloPayment = async (req, res) => {
    try {
        const { transaction_id } = req.params;

        const payment = await Payment.findOne({ transaction_id });

        if (!payment) {
            return res.status(404).json({ message: 'Transaction ID not found' });
        }

        // For sandbox/mock testing, automatically approve pending transactions when verified!
        const apiKey = process.env.SIFALO_API_KEY || 'your_api_key';
        if (apiKey === 'your_api_key' && payment.status === 'pending') {
            payment.status = 'paid';
            await payment.save();
            await completeRegistration(payment);
        }

        res.status(200).json({
            transaction_id: payment.transaction_id,
            status: payment.status,
            amount: payment.amount,
            payment
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    initializeSifaloPayment,
    handleSifaloWebhook,
    verifySifaloPayment
};
