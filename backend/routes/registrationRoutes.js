const express = require('express');
const router = express.Router();
const {
    getFreshClasses,
    registerFresh,
    registerSemester,
    getRegisteredStudents
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/classes').get(protect, getFreshClasses);
router.route('/fresh').post(protect, registerFresh);
router.route('/semester').post(protect, registerSemester);
router.route('/students').get(protect, getRegisteredStudents);

module.exports = router;
