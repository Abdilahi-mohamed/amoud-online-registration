const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    fullName: { type: String },
    studentId: { type: String, unique: true, sparse: true },
    faculty: { type: String },
    department: { type: String },
    year: { type: String, enum: ['Freshman', 'Sophomore', 'Junior', 'Senior'] },
    phone: { type: String },
    email: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profileImage: { type: String },
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-save hook to hash password
// userSchema.pre('save', async function (next) {
//     // Only hash the password if it has been modified (or is new)
//     if (!this.isModified('password')) return next();

//     try {
//         // Hash password with cost of 12
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// Method to check password match
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
