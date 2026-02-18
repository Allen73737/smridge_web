const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'REGISTER',
            role: 'user',
            details: 'User registered',
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Attempting login for: ${email}`);

        // Check for user email
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');

        if (user && (await user.matchPassword(password))) {
            console.log('Password matched');

            // Check if blocked
            if (user.isBlocked) {
                res.status(403);
                throw new Error('Account is blocked. Contact admin.');
            }

            // Update last active
            user.lastActive = Date.now();
            await user.save();
            console.log('Last active updated');

            // Log activity
            try {
                await ActivityLog.create({
                    userId: user._id,
                    action: 'LOGIN',
                    role: user.role,
                    details: 'User logged in',
                });
                console.log('Activity logged');
            } catch (logErr) {
                console.error('Activity log failed:', logErr);
                // Continue login even if log fails
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
