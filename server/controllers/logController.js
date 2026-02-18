const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
    const logs = await ActivityLog.find()
        .populate('userId', 'name email')
        .sort({ timestamp: -1 });
    res.json(logs);
};

module.exports = { getLogs };
