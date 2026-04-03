const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 🕒 Update lastActive (Throttled: 5 mins)
            const now = new Date();
            const fiveMinutes = 5 * 60 * 1000;

            await User.findOneAndUpdate(
                { 
                    _id: decoded.id, 
                    $or: [
                        { lastActive: { $lt: new Date(now - fiveMinutes) } },
                        { lastActive: { $exists: false } },
                        { lastActive: null }
                    ]
                },
                { $set: { lastActive: now } },
                { timestamps: false }
            );

            const user = await User.findById(decoded.id).select('-password');

            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401);
                throw new Error('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};

module.exports = { protect };
