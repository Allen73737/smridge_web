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
            gasLimit: 1,
            temperatureLimit: 5,
            humidityLimit: 85,
            freshnessWarningLevel: 50,
        });
    }
};

// @desc    Update thresholds
// @route   PUT /api/threshold/update
// @access  Private/Admin
const updateThresholds = async (req, res) => {
    const { gasLimit, temperatureLimit, humidityLimit, freshnessWarningLevel } = req.body;

    const threshold = await Threshold.create({
        gasLimit,
        temperatureLimit,
        humidityLimit,
        freshnessWarningLevel,
        updatedBy: req.user._id,
    });

    if (threshold) {
        await ActivityLog.create({
            userId: req.user._id,
            action: 'UPDATE_THRESHOLD',
            role: 'admin',
            details: 'Updated global environmental thresholds',
        });

        const io = req.app.get('socketio');
        io.emit('thresholdUpdated', threshold);

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
