const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    paymentNumber: { type: String, required: true }, // Old direct payment field, or reference_id mapping
    
    // Sifalo Pay Specific Fields
    transaction_id: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    payment_method: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    phone: { type: String },
    
    // Temporary registration details to complete registration asynchronously upon webhook success
    pendingRegistrationData: {
        type: { type: String, enum: ['fresh', 'semester'] },
        semester: { type: Number },
        department: { type: String },
        year: { type: String },
        className: { type: String },
        faculty: { type: String }
    },
    
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
