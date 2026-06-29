const User = require('../models/User');
const AllowedCredential = require('../models/AllowedCredential');
const bcrypt = require('bcrypt');

const compareStoredPassword = async (storedPassword, plainPassword) => {
    if (!storedPassword) return false;
    const isBcrypt =
        storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$');
    if (isBcrypt) {
        return bcrypt.compare(plainPassword, storedPassword);
    }
    return storedPassword === plainPassword;
};

const validateSecondaryLogin = async (req, res) => {
    const { id, password } = req.body;
    const trimmedId = String(id || '').trim();
    const trimmedPassword = String(password || '').trim();

    if (!trimmedId || !trimmedPassword) {
        return res.status(400).json({ message: 'ID and Password are required' });
    }

    try {
        const allowedCred = await AllowedCredential.findOne({ studentId: trimmedId });
        let passwordMatch = false;

        if (allowedCred) {
            passwordMatch = await compareStoredPassword(
                allowedCred.password,
                trimmedPassword
            );
        }

        if (!passwordMatch) {
            const user = await User.findOne({
                $or: [{ studentId: trimmedId }, { username: trimmedId }],
                role: 'student'
            });
            if (user?.password) {
                passwordMatch = await compareStoredPassword(
                    user.password,
                    trimmedPassword
                );
            }
        }

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid ID or Password' });
        }

        let user = await User.findOne({
            $or: [{ studentId: trimmedId }, { username: trimmedId }]
        });

        if (!user) {
            const hashedPassword = await bcrypt.hash(trimmedPassword, await bcrypt.genSalt(10));
            user = await User.create({
                username: trimmedId,
                studentId: trimmedId,
                password: hashedPassword,
                role: 'student',
                isApproved: true
            });
        }

        return res.status(200).json({
            message: 'Secondary login successful',
            success: true,
            studentId: trimmedId
        });
    } catch (error) {
        console.error('Secondary Auth Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    validateSecondaryLogin
};
