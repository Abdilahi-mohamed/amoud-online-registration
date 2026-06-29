const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getFacultyDashboard } = require('../controllers/facultyController');

router.get('/', protect, getFacultyDashboard);

module.exports = router;
