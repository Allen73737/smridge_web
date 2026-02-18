const FridgeStatus = require('../models/FridgeStatus');

// @desc    Get all fridge statuses
// @route   GET /api/fridge
// @access  Private/Admin
const getFridgeStatuses = async (req, res) => {
    const statuses = await FridgeStatus.find({}).populate('userId', 'name email');
    res.json(statuses);
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
    const { freshnessPercentage, gasLevel, temperature, humidity, doorStatus } = req.body;

    let status = await FridgeStatus.findOne({ userId: req.user._id });

    if (status) {
        status.freshnessPercentage = freshnessPercentage ?? status.freshnessPercentage;
        status.gasLevel = gasLevel ?? status.gasLevel;
        status.temperature = temperature ?? status.temperature;
        status.humidity = humidity ?? status.humidity;
        status.doorStatus = doorStatus ?? status.doorStatus;
        status.lastUpdated = Date.now();

        await status.save();

        // Emit socket event (handled in server.js via app set)
        const io = req.app.get('socketio');
        io.emit('fridgeUpdated', status);

        res.json(status);
    } else {
        // Create new if not exists
        const newStatus = await FridgeStatus.create({
            userId: req.user._id,
            freshnessPercentage,
            gasLevel,
            temperature,
            humidity,
            doorStatus,
        });

        const io = req.app.get('socketio');
        io.emit('fridgeUpdated', newStatus);

        res.status(201).json(newStatus);
    }
};

module.exports = {
    getFridgeStatuses,
    getFridgeStatus,
    updateFridgeStatus,
};
