const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FridgeStatus = require('./models/FridgeStatus');
const SensorData = require('./models/SensorData');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedStats = async () => {
    try {
        await connectDB();

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin found. Please create an admin first.');
            process.exit(1);
        }

        console.log('Clearing existing stats data...');
        await FridgeStatus.deleteMany({});
        await SensorData.deleteMany({});
        // We keep ActivityLogs but add new ones

        console.log('Seeding Dashboard Stats...');

        // 1. Fridge Statuses (for Avg Freshness and Active Fridges)
        const fridges = [
            { userId: admin._id, freshnessPercentage: 85, temperature: 3.5, humidity: 45, gasLevel: 120, doorStatus: 'closed' },
        ];
        
        // Add some dummy users/fridges if needed
        const dummyUsers = await User.find({ role: 'user' }).limit(5);
        dummyUsers.forEach(u => {
            fridges.push({ userId: u._id, freshnessPercentage: Math.floor(Math.random() * 40) + 60, temperature: 4.2, humidity: 50, gasLevel: 150, doorStatus: 'closed' });
        });

        await FridgeStatus.insertMany(fridges);

        // 2. Sensor Data (for Energy Trends - last 7 days)
        const sensorEntries = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            sensorEntries.push({
                userId: admin._id,
                temperature: 3.5,
                humidity: 45,
                gasLevel: 100,
                weight: 50,
                doorStatus: 'closed',
                energyConsumption: Math.random() * 5 + 5, // 5-10 W
                timestamp: date
            });
        }
        await SensorData.insertMany(sensorEntries);

        // 3. Activity Logs (for System Alerts)
        const alerts = [
            { userId: admin._id, action: 'TEMP_ALERT', role: 'admin', details: 'Temperature exceeded 5°C threshold', timestamp: new Date() },
            { userId: admin._id, action: 'SPOILAGE_ALERT', role: 'admin', details: 'Ethylene gas spike detected in zone A', timestamp: new Date() }
        ];
        await ActivityLog.insertMany(alerts);

        console.log('Dashboard Stats Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding stats:', error);
        process.exit(1);
    }
};

seedStats();
