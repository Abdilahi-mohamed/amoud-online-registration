const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

// Student routes
router.post('/', protect, submitFeedback);

// Admin routes
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

router.get('/', protect, adminOnly, getAllFeedback);
router.put('/:id', protect, adminOnly, updateFeedbackStatus);

module.exports = router;