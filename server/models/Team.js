const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        trim: true,
        default: 'Founder'
    },
    image: {
        type: String, // 3D Statue image path
        required: true
    },
    photo: {
        type: String, // Real photo path
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    gmail: {
        type: String,
        default: ''
    },
    instagram: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TeamMember', teamSchema);
