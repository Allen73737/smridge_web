const APK = require('../models/APK');
const ActivityLog = require('../models/ActivityLog');

// @desc    Upload new APK
// @route   POST /api/apk/upload
// @access  Private/Admin
const uploadAPK = async (req, res) => {
    try {
        console.log('--- Upload APK Started ---');
        const { version, releaseNotes, platform, isLink, externalLink } = req.body;
        console.log('Body:', { version, platform, isLink, externalLink });
        
        if (!req.file && isLink !== 'true') {
            console.log('Error: No file or link');
            res.status(400);
            throw new Error('No file or link provided');
        }

        const apkData = {
            version,
            platform: platform || 'android',
            releaseNotes,
            isLink: isLink === 'true',
        };

        if (isLink === 'true') {
            apkData.fileUrl = externalLink;
            apkData.fileSize = 'Link';
        } else {
            // req.file.path is the URL provided by Cloudinary
            apkData.fileUrl = req.file.path;
            apkData.fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
        }
        
        // Set as latest by default for new uploads
        await APK.updateMany({ platform }, { isLatest: false });
        apkData.isLatest = true;
        
        console.log('Creating APK record:', apkData);
        const apk = await APK.create(apkData);
        console.log('APK record created:', apk._id);

        if (apk) {
            console.log('Creating Activity Log for user:', req.user._id);
            const log = await ActivityLog.create({
                userId: req.user._id,
                action: 'DEPLOY_BUILD',
                role: 'admin',
                details: `Deployed ${platform} build v${version}${isLink === 'true' ? ' (Link)' : ''}`
            });

            // Populate user info and emit socket
            await log.populate('userId', 'name email');
            const io = req.app.get('socketio');
            if (io) io.emit('logAdded', log);

            res.status(201).json(apk);
        } else {
            console.error('Failed to create APK record after DB call');
            res.status(400).json({ message: 'Invalid APK data' });
        }
    } catch (error) {
        console.error('--- Upload APK ERROR ---');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get latest version for a platform
// @route   GET /api/apk/latest/:platform
// @access  Public
const getLatestAPK = async (req, res) => {
    const platform = req.params.platform || 'android';
    const apk = await APK.findOne({ platform, isLatest: true });
    if (apk) {
        res.json(apk);
    } else {
        res.status(404).json({ message: `No ${platform} version found` });
    }
};

// @desc    Get all versions for a platform
// @route   GET /api/apk/history/:platform
// @access  Public
const getAppHistory = async (req, res) => {
    const platform = req.params.platform || 'android';
    const history = await APK.find({ platform }).sort({ createdAt: -1 });
    res.json(history);
};

// @desc    Get all APKs (Admin)
// @route   GET /api/apk/all
// @access  Private/Admin
const getAllAPKs = async (req, res) => {
    const apks = await APK.find().sort({ createdAt: -1 });
    res.json(apks);
};

// @desc    Delete a build
// @route   DELETE /api/apk/:id
// @access  Private/Admin
// @desc    Set latest APK for a platform
// @route   PUT /api/apk/:id/latest
// @access  Private/Admin
const setLatestAPK = async (req, res) => {
    try {
        const apk = await APK.findById(req.params.id);
        if (!apk) {
            return res.status(404).json({ message: 'Build not found' });
        }

        // Unset all others for the same platform
        await APK.updateMany({ platform: apk.platform }, { isLatest: false });
        
        // Set this one as latest
        apk.isLatest = true;
        await apk.save();

        // Log action
        const log = await ActivityLog.create({
            userId: req.user._id,
            action: 'UPDATE_BUILD',
            role: 'admin',
            details: `Set ${apk.platform} build v${apk.version} as latest`
        });

        // Populate user info and emit socket
        await log.populate('userId', 'name email');
        const io = req.app.get('socketio');
        if (io) io.emit('logAdded', log);

        res.json(apk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAPK = async (req, res) => {
    try {
        const apk = await APK.findById(req.params.id);
        if (apk) {
            console.log(`--- Admin ${req.user._id} is deleting ${apk.platform} v${apk.version} ---`);
            
            // Standard Mongoose v6+ deletion
            await APK.deleteOne({ _id: req.params.id });

            // Audit Log
            const log = await ActivityLog.create({
                userId: req.user._id,
                action: 'DELETE_BUILD',
                role: 'admin',
                details: `Removed ${apk.platform} version ${apk.version} from ecosystem`
            });

            // Populate user info and emit socket
            await log.populate('userId', 'name email');
            const io = req.app.get('socketio');
            if (io) io.emit('logAdded', log);

            res.json({ message: 'Build removed from ecosystem' });
        } else {
            res.status(404).json({ message: 'Build not found' });
        }
    } catch (error) {
        console.error('Delete APK error:', error);
        res.status(500).json({ message: 'Internal server error during deletion' });
    }
};

module.exports = {
    uploadAPK,
    getLatestAPK,
    getAllAPKs,
    getAppHistory,
    deleteAPK,
    setLatestAPK,
};
