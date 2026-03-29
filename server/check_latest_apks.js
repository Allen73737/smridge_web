const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const APK = require('../server/models/APK');

async function checkAPKs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const apks = await APK.find().sort({ createdAt: -1 }).limit(5);
        console.log(`Latest 5 APKs:`);
        apks.forEach(apk => {
            console.log(`- ID: ${apk._id}, Platform: ${apk.platform}, Version: ${apk.version}, fileUrl: ${apk.fileUrl}, createdAt: ${apk.createdAt}`);
        });

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAPKs();
