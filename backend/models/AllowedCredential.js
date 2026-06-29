const mongoose = require('mongoose');

const allowedCredentialSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AllowedCredential', allowedCredentialSchema);
