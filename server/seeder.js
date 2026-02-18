const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();

    try {
        const adminExists = await User.findOne({ email: 'admin@smridge.com' });

        if (adminExists) {
            await User.deleteOne({ email: 'admin@smridge.com' });
            console.log('Existing admin removed');
        }

        const adminUser = new User({
            name: 'Smridge Admin',
            email: 'admin@smridge.com',
            password: 'admin123',
            role: 'admin',
            isBlocked: false
        });

        await adminUser.save();

        console.log('Admin User Created!');
        console.log('Email: admin@smridge.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
