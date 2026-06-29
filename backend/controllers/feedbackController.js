const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user.id;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        const feedback = await Feedback.create({
            user: userId,
            subject,
            message
        });

        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all feedback (admin only)
// @route   GET /api/admin/feedback
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('user', 'username fullName').sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update feedback status (admin only)
// @route   PUT /api/admin/feedback/:id
// @access  Private/Admin
const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        feedback.status = status;
        await feedback.save();

        res.json({ message: 'Feedback status updated', feedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitFeedback, getAllFeedback, updateFeedbackStatus };