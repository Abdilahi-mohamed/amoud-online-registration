const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const AllowedCredential = require('../models/AllowedCredential');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const {
    hashPassword,
    upsertAllowedCredential,
    studentLoginIdExists
} = require('../utils/credentialSync');

// All admin routes require admin role
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Multer: store in memory for Excel parsing
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @desc    Bulk register users from Excel file
// @route   POST /api/admin/bulk-register
// @access  Private/Admin
router.post('/bulk-register', protect, adminOnly, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileName = (req.file.originalname || '').toLowerCase();
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.csv')) {
            return res.status(400).json({ message: 'Only .xlsx and .csv files are allowed.' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty or invalid' });
        }

        const results = { success: [], failed: [], skipped: [] };

        for (const row of rows) {
            const studentId = String(row['studentId'] || row['Student ID'] || row['student_id'] || row['ID'] || row['Id'] || '').trim();
            const username = String(row['username'] || row['Username'] || row['USERNAME'] || studentId || '').trim();
            const password = String(row['password'] || row['Password'] || row['PASSWORD'] || '').trim();
            const fullName = String(row['fullName'] || row['Full Name'] || row['name'] || row['Name'] || '').trim();
            const faculty = String(row['faculty'] || row['Faculty'] || '').trim();
            const department = String(row['department'] || row['Department'] || faculty || '').trim();
            const phone = String(row['phone'] || row['Phone'] || row['PHONE'] || '').trim();
            const year = String(row['year'] || row['Year'] || '').trim();

            const effectiveId = studentId || username;

            if (!effectiveId || !password) {
                results.failed.push({ row: effectiveId || '(empty)', reason: 'Missing student ID or password' });
                continue;
            }

            if (await studentLoginIdExists(effectiveId)) {
                results.skipped.push({ username: effectiveId, reason: 'Student ID already exists' });
                continue;
            }

            const validYears = ['Freshman', 'Sophomore', 'Junior', 'Senior', ''];
            const normalizedYear = validYears.includes(year) ? year : '';

            try {
                const hashedPassword = await hashPassword(password);

                const newUser = await User.create({
                    username,
                    password: hashedPassword,
                    role: 'student',
                    fullName: fullName || undefined,
                    studentId: effectiveId,
                    faculty: faculty || undefined,
                    department: department || undefined,
                    phone: phone || undefined,
                    year: normalizedYear || undefined,
                    isApproved: true
                });

                await Registration.create({
                    user: newUser._id,
                    type: 'semester',
                    semester: 1,
                    department: department || 'General',
                    year: normalizedYear || 'Sophomore',
                    className: 'Class A',
                    studentId: effectiveId,
                    studentName: fullName || effectiveId,
                    faculty: faculty || undefined,
                    registeredBy: 'admin'
                });

                await upsertAllowedCredential(effectiveId, password);

                results.success.push({ username: effectiveId, fullName, studentId: effectiveId });
            } catch (err) {
                if (err.code === 11000) {
                    results.skipped.push({ username: effectiveId, reason: 'Student ID already exists' });
                } else {
                    results.failed.push({ username: effectiveId, reason: err.message });
                }
            }
        }

        res.status(200).json({
            message: `Bulk registration complete`,
            total: rows.length,
            successCount: results.success.length,
            skippedCount: results.skipped.length,
            failedCount: results.failed.length,
            success: results.success,
            skipped: results.skipped,
            failed: results.failed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload Allowed IDs and Passwords from Excel
// @route   POST /api/admin/upload-credentials
// @access  Private/Admin
router.post('/upload-credentials', protect, adminOnly, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty or invalid' });
        }

        let imported = 0;
        let skippedCount = 0;
        const errors = [];

        for (const row of rows) {
            const id = String(row['id'] || row['ID'] || row['Id'] || row['studentId'] || row['Student ID'] || row['student_id'] || '').trim();
            const password = String(row['password'] || row['Password'] || row['PASSWORD'] || '').trim();

            if (!id || !password) {
                skippedCount++;
                continue;
            }

            try {
                if (await studentLoginIdExists(id)) {
                    await syncStudentLoginAccess(id, password);
                    imported++;
                    continue;
                }

                const hashedPassword = await hashPassword(password);
                await User.create({
                    username: id,
                    password: hashedPassword,
                    role: 'student',
                    studentId: id,
                    isApproved: true
                });
                await upsertAllowedCredential(id, password);
                imported++;
            } catch (err) {
                if (err.code === 11000) {
                    skippedCount++;
                } else {
                    errors.push({ studentId: id, reason: err.message });
                }
            }
        }

        if (imported === 0 && skippedCount === 0 && errors.length > 0) {
            return res.status(400).json({ message: 'No valid rows imported. Check column headers.' });
        }

        res.status(200).json({
            message: 'Credentials synced for frontend login',
            totalImported: imported,
            skippedCount,
            errors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a single student credential (ID + hashed password)
// @route   POST /api/admin/add-single-credential
// @access  Private/Admin
router.post('/add-single-credential', protect, adminOnly, async (req, res) => {
    try {
        const { studentId, password } = req.body;
        const trimmedId = String(studentId || '').trim();
        const trimmedPassword = String(password || '').trim();

        if (!trimmedId || !trimmedPassword) {
            return res.status(400).json({ message: 'Student ID and Password are required.' });
        }

        if (await studentLoginIdExists(trimmedId)) {
            return res.status(409).json({ message: `Student ID "${trimmedId}" already exists.` });
        }

        const hashedPassword = await hashPassword(trimmedPassword);
        await User.create({
            username: trimmedId,
            password: hashedPassword,
            role: 'student',
            studentId: trimmedId,
            isApproved: true
        });
        const newCred = await upsertAllowedCredential(trimmedId, trimmedPassword);

        res.status(201).json({
            message: `Student "${trimmedId}" added and can log in on the frontend.`,
            studentId: newCred.studentId
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Student ID already exists.' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all allowed credentials
// @route   GET /api/admin/allowed-credentials
// @access  Private/Admin
router.get('/allowed-credentials', protect, adminOnly, async (req, res) => {
    try {
        const credentials = await AllowedCredential.find().sort({ createdAt: -1 });
        res.json(credentials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update an allowed credential
// @route   PUT /api/admin/allowed-credentials/:id
// @access  Private/Admin
router.put('/allowed-credentials/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, password } = req.body;
        const trimmedId = String(studentId || '').trim();

        if (!trimmedId || !password) {
            return res.status(400).json({ message: 'Student ID and password are required.' });
        }

        const existingCredential = await AllowedCredential.findById(id);
        if (!existingCredential) {
            return res.status(404).json({ message: 'Allowed credential not found.' });
        }

        const conflictingCredential = await AllowedCredential.findOne({ studentId: trimmedId, _id: { $ne: id } });
        if (conflictingCredential) {
            return res.status(409).json({ message: 'Student ID already exists in allowed credentials.' });
        }

        const currentStudentId = existingCredential.studentId;
        if (trimmedId !== currentStudentId) {
            const conflictingUser = await User.findOne({
                $or: [{ studentId: trimmedId }, { username: trimmedId }]
            });
            if (conflictingUser) {
                return res.status(409).json({ message: 'Student ID already exists in user records.' });
            }
        }

        const hashedPassword = await hashPassword(password);
        existingCredential.studentId = trimmedId;
        existingCredential.password = hashedPassword;
        await existingCredential.save();

        await User.updateMany(
            { $or: [{ studentId: currentStudentId }, { username: currentStudentId }] },
            { $set: { studentId: trimmedId, username: trimmedId, password: hashedPassword } }
        );

        res.json({ message: 'Allowed credential updated successfully', credential: existingCredential });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete an allowed credential
// @route   DELETE /api/admin/allowed-credentials/:id
// @access  Private/Admin
router.delete('/allowed-credentials/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const credential = await AllowedCredential.findById(id);
        if (!credential) {
            return res.status(404).json({ message: 'Allowed credential not found.' });
        }

        await credential.deleteOne();
        res.json({ message: 'Allowed credential deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalRegistrations = await Registration.countDocuments();
        const totalPayments = await Payment.countDocuments();
        const recentPayments = await Payment.find().sort({ date: -1 }).limit(10);
        const recentRegistrations = await Registration.find().sort({ createdAt: -1 }).limit(10).populate('user', 'username');

        res.json({
            stats: {
                totalUsers,
                totalRegistrations,
                totalPayments
            },
            recentPayments,
            recentRegistrations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Search student by ID
// @route   GET /api/admin/search/:studentId
// @access  Private/Admin
router.get('/search/:studentId', protect, adminOnly, async (req, res) => {
    try {
        const { studentId } = req.params;
        const user = await User.findOne({ username: studentId });
        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const registrations = await Registration.find({ user: user._id }).populate('class', 'name');
        const payments = await Payment.find({ user: user._id });

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            registrations,
            payments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create registration for student
// @route   POST /api/admin/registrations
// @access  Private/Admin
router.post('/registrations', protect, adminOnly, async (req, res) => {
    try {
        const { userId, semester, department, classId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const registration = await Registration.create({
            user: userId,
            type: 'semester',
            semester: parseInt(semester),
            department,
            class: classId
        });

        res.status(201).json({ message: 'Registration created', registration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register a new student with full details and create registration
// @route   POST /api/admin/register-student-full
// @access  Private/Admin
router.post('/register-student-full', protect, adminOnly, async (req, res) => {
    try {
        const {
            fullName, studentId, username, password, faculty, department, year, semester, classId,
            phone, email, gender, profileImage
        } = req.body;
        const effectiveUsername = (username || studentId || '').trim();
        const effectivePassword = (password || studentId || '').trim();

        const trimmedStudentId = String(studentId || '').trim();

        if (!effectiveUsername || !trimmedStudentId || !effectivePassword) {
            return res.status(400).json({ message: 'Full name, student ID, and password are required' });
        }

        if (await studentLoginIdExists(trimmedStudentId)) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        const hashedPassword = await hashPassword(effectivePassword);

        // Create the user
        const newUser = await User.create({
            username: effectiveUsername,
            password: hashedPassword,
            role: 'student',
            fullName,
            studentId: trimmedStudentId,
            faculty,
            department,
            year,
            phone: phone || undefined,
            email: email || undefined,
            gender: gender || undefined,
            profileImage: profileImage || undefined,
            isApproved: true
        });

        // Create the registration record
        const registration = await Registration.create({
            user: newUser._id,
            type: 'semester',
            semester: parseInt(semester) || 1,
            department,
            year: year,
            className: classId,
            studentId: trimmedStudentId,
            studentName: fullName,
            faculty,
            registeredBy: 'admin'
        });

        await upsertAllowedCredential(trimmedStudentId, effectivePassword);

        res.status(201).json({ 
            message: 'Student registered successfully and can log in on the frontend second login page.', 
            user: { username: newUser.username, studentId: newUser.studentId },
            registration
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Student ID or username already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all registrations
// @route   GET /api/admin/registrations
// @access  Private/Admin
router.get('/registrations', protect, adminOnly, async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('user', 'username fullName studentId faculty department phone email gender profileImage year')
            .populate('class', 'name')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a registration
// @route   PUT /api/admin/registrations/:id
// @access  Private/Admin
router.put('/registrations/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, studentName, department, year, semester, className, faculty, phone, email, gender } = req.body;

        const registration = await Registration.findById(id).populate('user');
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (studentId && studentId !== registration.studentId) {
            const existingUser = await User.findOne({ studentId });
            if (existingUser && existingUser._id.toString() !== registration.user._id.toString()) {
                return res.status(400).json({ message: 'Student ID already registered' });
            }
            registration.studentId = studentId;
            if (registration.user) {
                registration.user.studentId = studentId;
            }
        }

        if (studentName) {
            registration.studentName = studentName;
            if (registration.user) {
                registration.user.fullName = studentName;
            }
        }

        if (department !== undefined) registration.department = department;
        if (faculty !== undefined) registration.faculty = faculty;
        if (year !== undefined) registration.year = year;
        if (semester !== undefined) registration.semester = parseInt(semester);
        if (className !== undefined) registration.className = className;

        if (registration.user) {
            if (department !== undefined) registration.user.department = department;
            if (faculty !== undefined) registration.user.faculty = faculty;
            if (phone !== undefined) registration.user.phone = phone;
            if (email !== undefined) registration.user.email = email;
            if (gender !== undefined) registration.user.gender = gender;
            await registration.user.save();
        }
        await registration.save();

        res.json({ message: 'Registration updated successfully', registration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a registration
// @route   DELETE /api/admin/registrations/:id
// @access  Private/Admin
router.delete('/registrations/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await Registration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        const userId = registration.user;
        const deletedStudentId = registration.studentId;
        await registration.deleteOne();

        const otherRegistration = await Registration.exists({ user: userId });
        if (!otherRegistration) {
            await User.findByIdAndDelete(userId);
            if (deletedStudentId) {
                await removeAllowedCredential(deletedStudentId);
            }
        }

        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
router.get('/payments', protect, adminOnly, async (req, res) => {
    try {
        const payments = await Payment.find().populate('user', 'username').sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all student users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Approve a student account
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
router.put('/users/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user || user.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        user.isApproved = true;
        await user.save();

        res.json({ message: 'Student approved successfully', user: { id: user._id, username: user.username, isApproved: user.isApproved } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Export approved student IDs as CSV
// @route   GET /api/admin/export/allowed-students
// @access  Private/Admin
router.get('/export/allowed-students', protect, adminOnly, async (req, res) => {
    try {
        const allowedStudents = await User.find({ role: 'student', isApproved: true }).select('studentId username fullName faculty department year');

        const rows = [
            ['Student ID', 'Username', 'Full Name', 'Faculty', 'Department', 'Year']
        ];

        allowedStudents.forEach((student) => {
            rows.push([
                student.studentId || '',
                student.username || '',
                student.fullName || '',
                student.faculty || '',
                student.department || '',
                student.year || ''
            ]);
        });

        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=allowed-students.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;