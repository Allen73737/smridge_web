const mongoose = require('mongoose');
const dotenv = require('dotenv');
const APK = require('./models/APK');
const connectDB = require('./config/db');

dotenv.config();

const seedAPKs = async () => {
    try {
        await connectDB();

        // Clear existing
        await APK.deleteMany();

        console.log('Seeding APKs...');

        const fakeAPKs = [
            {
                version: '1.0.4-stable',
                platform: 'android',
                fileUrl: '/uploads/smridge_v1.0.4.apk',
                fileSize: '42.5 MB',
                releaseNotes: 'Initial production release for android. Core freshness monitoring active.'
            },
            {
                version: '1.0.4-dev',
                platform: 'ios',
                fileUrl: '/uploads/smridge_v1.0.4.ipa',
                fileSize: '38.2 MB',
                releaseNotes: 'iOS ecosystem sync beta. Biometric guard integrated.'
            }
        ];

        await APK.insertMany(fakeAPKs);

        console.log('APKs Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding APKs:', error);
        process.exit(1);
    }
};

seedAPKs();
