const bcrypt = require('bcrypt');
const User = require('../models/User');
const AllowedCredential = require('../models/AllowedCredential');

const hashPassword = async (plainPassword) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(String(plainPassword), salt);
};

/**
 * Upsert allowed credential for frontend secondary (Excel) login.
 * Passwords are always stored bcrypt-hashed.
 */
const upsertAllowedCredential = async (studentId, plainPassword) => {
    const trimmedId = String(studentId || '').trim();
    if (!trimmedId || !plainPassword) {
        throw new Error('Student ID and password are required for credential sync');
    }
    const hashedPassword = await hashPassword(plainPassword);
    return AllowedCredential.findOneAndUpdate(
        { studentId: trimmedId },
        { studentId: trimmedId, password: hashedPassword },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

const studentLoginIdExists = async (studentId) => {
    const trimmedId = String(studentId || '').trim();
    if (!trimmedId) return false;

    const [existingCred, existingUser] = await Promise.all([
        AllowedCredential.findOne({ studentId: trimmedId }),
        User.findOne({
            $or: [{ studentId: trimmedId }, { username: trimmedId }]
        })
    ]);

    return !!(existingCred || existingUser);
};

const removeAllowedCredential = async (studentId) => {
    const trimmedId = String(studentId || '').trim();
    if (!trimmedId) return;
    await AllowedCredential.deleteOne({ studentId: trimmedId });
};

/** Keep User + AllowedCredential passwords in sync for secondary frontend login */
const syncStudentLoginAccess = async (studentId, plainPassword) => {
    const trimmedId = String(studentId || '').trim();
    const hashedPassword = await hashPassword(plainPassword);
    await upsertAllowedCredential(trimmedId, plainPassword);
    await User.updateMany(
        { $or: [{ studentId: trimmedId }, { username: trimmedId }] },
        { $set: { password: hashedPassword } }
    );
};

module.exports = {
    hashPassword,
    upsertAllowedCredential,
    studentLoginIdExists,
    removeAllowedCredential,
    syncStudentLoginAccess
};
