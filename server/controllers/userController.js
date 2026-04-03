const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.remove();
        // Log activity
        const log = await ActivityLog.create({
            userId: req.user._id,
            action: 'DELETE_USER',
            role: 'admin',
            details: `Deleted user ${user.email}`,
        });

        // Populate user info for real-time display
        await log.populate('userId', 'name email');

        const io = req.app.get('socketio');
        if (io) io.emit('logAdded', log);
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Block/Unblock user
// @route   PUT /api/users/block/:id
// @access  Private/Admin
const blockUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isBlocked = !user.isBlocked;
        await user.save();

        const log = await ActivityLog.create({
            userId: req.user._id,
            action: user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
            role: 'admin',
            details: `${user.isBlocked ? 'Blocked' : 'Unblocked'} user ${user.email}`,
        });

        // Populate user info for real-time display
        await log.populate('userId', 'name email');

        const io = req.app.get('socketio');
        if (io) io.emit('logAdded', log);

        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user role
// @route   PUT /api/users/role/:id
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
        await user.save();

        const log = await ActivityLog.create({
            userId: req.user._id,
            action: 'UPDATE_ROLE',
            role: 'admin',
            details: `Updated role for ${user.email} to ${user.role}`,
        });

        // Populate user info for real-time display
        await log.populate('userId', 'name email');

        const io = req.app.get('socketio');
        if (io) io.emit('logAdded', log);

        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Toggle simulation status for user
// @route   PUT /api/users/simulation/:id
// @access  Private/Admin
const toggleSimulationStatus = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isSimulationEnabled = !user.isSimulationEnabled;
        await user.save();

        const log = await ActivityLog.create({
            userId: req.user._id,
            action: 'TOGGLE_SIMULATION',
            role: 'admin',
            details: `Simulation ${user.isSimulationEnabled ? 'enabled' : 'disabled'} for ${user.email}`,
        });

        // Populate user info for real-time display
        await log.populate('userId', 'name email');

        const io = req.app.get('socketio');
        if (io) io.emit('logAdded', log);

        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = {
    getUsers,
    deleteUser,
    blockUser,
    updateUserRole,
    toggleSimulationStatus,
};
