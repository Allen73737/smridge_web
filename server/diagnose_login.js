const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

async function diagnose() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        const email = 'admin@smridge.com';
        const password = 'admin123';
        
        console.log(`Searching for: ${email}`);
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('FAIL: User not found in database.');
            process.exit(1);
        }
        
        console.log('User found. Checking password...');
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            console.log('FAIL: Password does not match.');
            console.log('Stored hash:', user.password);
            process.exit(1);
        }
        
        console.log('SUCCESS: Password matches.');
        
        if (user.isBlocked) {
            console.log('FAIL: User is blocked.');
            process.exit(1);
        }
        
        console.log('SUCCESS: User is not blocked.');
        console.log('Role:', user.role);
        
        process.exit(0);
    } catch (err) {
        console.error('DIAGNOSIS ERROR:', err);
        process.exit(1);
    }
}

diagnose();
