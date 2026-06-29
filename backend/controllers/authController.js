const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    try {
        const { username, password, role, fullName, studentId, faculty, department, year } = req.body;
        const userRole = role || 'student';
        const trimmedUsername = String(username).trim();

        if (!trimmedUsername || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: trimmedUsername },
                { studentId: trimmedUsername }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Username or student ID already exists' });
        }

        if (userRole === 'admin') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                username: trimmedUsername,
                password: hashedPassword,
                role: 'admin',
                isApproved: true
            });

            if (user) {
                return res.status(201).json({
                    message: 'Admin account created successfully',
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user._id)
                });
            }

            return res.status(400).json({ message: 'Invalid user data' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: trimmedUsername,
            password: hashedPassword,
            role: 'student',
            isApproved: true
        });

        if (user) {
            return res.status(201).json({
                message: 'Account created successfully.',
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id)
            });
        }

        res.status(400).json({ message: 'Invalid user data' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const trimmedIdentifier = String(username).trim();
        let user = await User.findOne({
            $or: [
                { username: trimmedIdentifier },
                { studentId: trimmedIdentifier }
            ]
        });

        // Admin check: If it's an admin, bypass the strict student Excel check
        if (user && user.role === 'admin') {
            if (!(await user.matchPassword(password))) {
                return res.status(401).json({ message: 'Invalid admin credentials' });
            }
            return res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id)
            });
        }

        // Student login using stored user credentials
        if (user) {
            if (!(await user.matchPassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            return res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id)
            });
        }

        return res.status(401).json({ message: 'Invalid credentials.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe };
