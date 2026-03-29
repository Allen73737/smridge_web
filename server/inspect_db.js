const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const FridgeStatus = require('./models/FridgeStatus');
const Threshold = require('./models/Threshold');
const ActivityLog = require('./models/ActivityLog');
const SensorData = require('./models/SensorData');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const userCount = await User.countDocuments();
        const fridgeCount = await FridgeStatus.countDocuments();
        const thresholdCount = await Threshold.countDocuments();
        const logCount = await ActivityLog.countDocuments();
        const sensorDataCount = await SensorData.countDocuments();

        console.log('Collections Summary:');
        console.log(`- Users: ${userCount}`);
        console.log(`- FridgeStatuses: ${fridgeCount}`);
        console.log(`- Thresholds: ${thresholdCount}`);
        console.log(`- ActivityLogs: ${logCount}`);
        console.log(`- SensorDatas: ${sensorDataCount}`);

        if (fridgeCount > 0) {
            const sampleFridge = await FridgeStatus.findOne();
            console.log('Sample Fridge Status:', sampleFridge);
        }

        if (userCount > 0) {
            const admins = await User.find({ role: 'admin' });
            console.log(`Admins found: ${admins.length}`);
            admins.forEach(a => console.log(` - ${a.name} (${a.email})`));
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkData();
