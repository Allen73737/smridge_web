const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: 'admin@smridge.com' });
        if (admin) {
            console.log('--- ADMIN USER FOUND ---');
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('isBlocked:', admin.isBlocked);
        } else {
            console.log('--- ADMIN USER NOT FOUND ---');
            console.log('Please run node seeder.js to create the admin user.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
