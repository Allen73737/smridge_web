const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const APK = require('../server/models/APK');

async function checkAPKs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const apks = await APK.find().sort({ createdAt: -1 });
        console.log(`Total APKs: ${apks.length}`);
        apks.forEach((apk, i) => {
            console.log(`${i+1}. Platform: ${apk.platform}, Version: ${apk.version}, CreatedAt: ${apk.createdAt}, URL: ${apk.fileUrl.substring(0, 50)}...`);
        });

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAPKs();
