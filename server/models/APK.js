const mongoose = require('mongoose');

const apkSchema = mongoose.Schema({
    version: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    releaseNotes: {
        type: String,
    },
    fileSize: {
        type: String, // e.g., '45.2 MB'
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const APK = mongoose.model('APK', apkSchema);

module.exports = APK;
