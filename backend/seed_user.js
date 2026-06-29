require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
const bcrypt = require('bcrypt');

connectDB();

const seedUser = async () => {
    try {
        await User.deleteMany({ username: 'testuser' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await User.create({
            username: 'testuser',
            password: hashedPassword,
            role: 'student',
            isApproved: true
        });

        console.log('Test user created: username: testuser, password: password123');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedUser();
