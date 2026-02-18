const mongoose = require('mongoose');

const activityLogSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    action: {
        type: String, // e.g., 'LOGIN', 'DELETE_USER'
        required: true,
    },
    role: {
        type: String, // 'admin' or 'user'
    },
    details: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
