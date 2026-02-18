const APK = require('../models/APK');
const ActivityLog = require('../models/ActivityLog');

// @desc    Upload new APK
// @route   POST /api/apk/upload
// @access  Private/Admin
const uploadAPK = async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const { version, releaseNotes } = req.body;

    const apk = await APK.create({
        version,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
        releaseNotes,
    });

    if (apk) {
        await ActivityLog.create({
            userId: req.user._id,
            action: 'UPLOAD_APK',
            role: 'admin',
            details: `Uploaded version ${version}`,
        });

        res.status(201).json(apk);
    } else {
        res.status(400);
        throw new Error('Invalid APK data');
    }
};

// @desc    Get latest APK
// @route   GET /api/apk/latest
// @access  Private
const getLatestAPK = async (req, res) => {
    const apk = await APK.findOne().sort({ createdAt: -1 });
    if (apk) {
        res.json(apk);
    } else {
        res.status(404);
        throw new Error('No APK found');
    }
};

// @desc    Get all APKs
// @route   GET /api/apk/all
// @access  Private/Admin
const getAllAPKs = async (req, res) => {
    const apks = await APK.find().sort({ createdAt: -1 });
    res.json(apks);
};

module.exports = {
    uploadAPK,
    getLatestAPK,
    getAllAPKs,
};
