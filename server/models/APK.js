const mongoose = require('mongoose');

const apkSchema = mongoose.Schema({
    version: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        enum: ['android', 'ios'],
        default: 'android',
    },
    fileUrl: {
        type: String,
        required: false, // Optional if it's a link
    },
    isLink: {
        type: Boolean,
        default: false,
    },
    externalLink: {
        type: String,
    },
    releaseNotes: {
        type: String,
    },
    fileSize: {
        type: String, // e.g., '45.2 MB'
    },
    isLatest: {
        type: Boolean,
        default: false,
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
