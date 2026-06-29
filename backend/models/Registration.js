const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['fresh', 'semester'], required: true },
    semester: { type: Number, required: true },
    
    // For fresh registration
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    
    // For semester registration
    department: { type: String },
    year: { type: String, enum: ['Sophomore', 'Junior', 'Senior'] },
    className: { type: String, enum: ['Class A', 'Class B', 'Class C', 'Class D', 'Class E', 'Class F'] },
    studentId: { type: String },
    studentName: { type: String },
    faculty: { type: String },
    registeredBy: { type: String, enum: ['admin', 'self'], default: 'self' }
}, { timestamps: true });

// Remove the unique index to allow multiple semester registrations
// Uniqueness is handled in the controller logic

module.exports = mongoose.model('Registration', registrationSchema);
