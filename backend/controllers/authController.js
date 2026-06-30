const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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

module.exports = { loginUser, getMe };
