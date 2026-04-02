const Threshold = require('../models/Threshold');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get thresholds
// @route   GET /api/threshold
// @access  Private
const getThresholds = async (req, res) => {
    // Assuming single global configuration document
    const threshold = await Threshold.findOne().sort({ createdAt: -1 });
    if (threshold) {
        res.json(threshold);
    } else {
        // Return defaults if none
        res.json({
            gasLimitMin: 0.1,
            gasLimitMax: 1.0,
            temperatureLimitMin: 0,
            temperatureLimitMax: 10,
            humidityLimitMin: 40,
            humidityLimitMax: 95,
            freshnessWarningLevel: 50,
        });
    }
};

// @desc    Update thresholds
// @route   PUT /api/threshold/update
// @access  Private/Admin
const updateThresholds = async (req, res) => {
    const {
        gasLimitMin,
        gasLimitMax,
        temperatureLimitMin,
        temperatureLimitMax,
        humidityLimitMin,
        humidityLimitMax,
        freshnessWarningLevel
    } = req.body;

    const threshold = await Threshold.create({
        gasLimitMin,
        gasLimitMax,
        temperatureLimitMin,
        temperatureLimitMax,
        humidityLimitMin,
        humidityLimitMax,
        freshnessWarningLevel,
        updatedBy: req.user._id,
    });

    if (threshold) {
        const log = await ActivityLog.create({
            userId: req.user._id,
            action: 'UPDATE_THRESHOLD',
            role: 'admin',
            details: 'Updated global environmental thresholds',
        });

        // Populate user info for real-time display
        await log.populate('userId', 'name email');

        const io = req.app.get('socketio');
        if (io) {
            io.emit('logAdded', log);
            io.emit('thresholdUpdated', threshold);
        }

        res.json(threshold);
    } else {
        res.status(400);
        throw new Error('Invalid threshold data');
    }
};

module.exports = {
    getThresholds,
    updateThresholds,
};
