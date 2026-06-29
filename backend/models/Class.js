const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Class A, Class B, etc.
    capacity: { type: Number, default: 60 },
    enrolledCount: { type: Number, default: 0 },
    semester: { type: Number, required: true }, // 1 or 2
    order: { type: Number, required: true } // 1, 2, 3... to maintain filling sequence
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
