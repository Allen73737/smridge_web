const FridgeStatus = require('../models/FridgeStatus');
const User = require('../models/User');
const SensorData = require('../models/SensorData');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all fridge statuses
// @route   GET /api/fridge
// @access  Private/Admin
const getFridgeStatuses = async (req, res) => {
    // Only get statuses for users with role 'user'
    const users = await User.find({ role: 'user' }).select('_id');
    const userIds = users.map(u => u._id);

    const statuses = await FridgeStatus.find({ userId: { $in: userIds } }).populate('userId', 'name email');
    
    // Add real-time sensor data check for EACH user
    const processedStatuses = await Promise.all(statuses.map(async (s) => {
        // Find the absolute latest SensorData for this specific user
        const latestData = await SensorData.findOne({ userId: s.userId._id }).sort({ timestamp: -1 });
        
        let lastUpdated = s.lastUpdated;
        let sensorValues = {
            temperature: s.temperature,
            humidity: s.humidity,
            gasLevel: s.gasLevel,
            doorStatus: s.doorStatus
        };

        // If sensor data is more recent than the recorded fridge status, use it
        if (latestData && latestData.timestamp > s.lastUpdated) {
            lastUpdated = latestData.timestamp;
            sensorValues = {
                temperature: latestData.temperature,
                humidity: latestData.humidity,
                gasLevel: latestData.gasLevel,
                doorStatus: latestData.doorStatus
            };
            
            // "Heal" the FridgeStatus record in background to keep it in sync
            FridgeStatus.updateOne({ _id: s._id }, { 
                lastUpdated: latestData.timestamp,
                ...sensorValues 
            }).catch(console.error);
        }

        const now = Date.now();
        const status = (now - new Date(lastUpdated).getTime()) < 5 * 60 * 1000 ? 'online' : 'offline';

        return {
            ...s._doc,
            ...sensorValues,
            lastUpdated,
            status
        };
    }));

    res.json(processedStatuses);
};

// @desc    Get single fridge status
// @route   GET /api/fridge/:userId
// @access  Private
const getFridgeStatus = async (req, res) => {
    const status = await FridgeStatus.findOne({ userId: req.params.userId });

    if (status) {
        res.json(status);
    } else {
        res.status(404);
        throw new Error('Fridge status not found');
    }
};

// @desc    Update fridge status (IoT endpoint)
// @route   PUT /api/fridge/update
// @access  Private
const updateFridgeStatus = async (req, res) => {
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins cannot have or update fridge status.' });
    }

    const { freshnessPercentage, gasLevel, temperature, humidity, doorStatus, weight, energyConsumption } = req.body;

    let status = await FridgeStatus.findOne({ userId: req.user._id });

    if (status) {
        status.freshnessPercentage = freshnessPercentage ?? status.freshnessPercentage;
        status.gasLevel = gasLevel ?? status.gasLevel;
        status.temperature = temperature ?? status.temperature;
        status.humidity = humidity ?? status.humidity;
        status.doorStatus = doorStatus ?? status.doorStatus;
        status.lastUpdated = Date.now();

        await status.save();
    } else {
        // Create new if not exists
        status = await FridgeStatus.create({
            userId: req.user._id,
            freshnessPercentage,
            gasLevel,
            temperature,
            humidity,
            doorStatus,
        });
    }

    // Persist to historical SensorData
    await SensorData.create({
        userId: req.user._id,
        temperature: temperature ?? (status ? status.temperature : 0),
        humidity: humidity ?? (status ? status.humidity : 0),
        gasLevel: gasLevel ?? (status ? status.gasLevel : 0),
        weight: weight ?? 0,
        doorStatus: doorStatus ?? (status ? status.doorStatus : 'closed'),
        energyConsumption: energyConsumption ?? 0,
    });

    // Emit socket event (handled in server.js via app set)
    const io = req.app.get('socketio');
    if (io) io.emit('fridgeUpdated', status);

    res.json(status);
};

// @desc    Get admin dashboard stats
// @route   GET /api/fridge/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        // Only consider non-admin fridges/users
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        const regularUsers = await User.find({ role: 'user' }).select('_id');
        const regularUserIds = regularUsers.map(u => u._id);
        
        const activeFridges = await FridgeStatus.countDocuments({ userId: { $in: regularUserIds } });
        
        // Sum alerts from last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const alertCount = await ActivityLog.countDocuments({
            action: { $in: ['SPOILAGE_ALERT', 'TEMP_ALERT', 'GAS_ALERT'] },
            timestamp: { $gte: yesterday },
            userId: { $in: regularUserIds }
        });

        const fridges = await FridgeStatus.find({ userId: { $in: regularUserIds } });
        const avgFreshness = fridges.length > 0
            ? fridges.reduce((acc, curr) => acc + (curr.freshnessPercentage || 0), 0) / fridges.length
            : 0;

        // Energy consumption trends (last 7 days)
        const energyTrends = await SensorData.aggregate([
            { $match: { 
                timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                userId: { $in: regularUserIds }
            } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                totalEnergy: { $sum: "$energyConsumption" }
            }},
            { $sort: { "_id": 1 } }
        ]);

        // Ecosystem activity trends (last 24 hours, hourly)
        const activityTrends = await ActivityLog.aggregate([
            { $match: { 
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                userId: { $in: regularUserIds }
            } },
            { $group: {
                _id: { $hour: "$timestamp" },
                count: { $sum: 1 }
            }},
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            totalUsers,
            activeFridges,
            alertCount: alertCount || 0,
            avgFreshness: Math.round(avgFreshness),
            energyTrends: energyTrends.length > 0 ? energyTrends : [],
            activityTrends: activityTrends.length > 0 ? activityTrends : []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFridgeStatuses,
    getFridgeStatus,
    updateFridgeStatus,
    getAdminStats,
};
