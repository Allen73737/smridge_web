const mongoose = require('mongoose');
require('dotenv').config();
const TeamMember = require('./models/Team');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await TeamMember.countDocuments();
        console.log('Total members in DB:', count);
        const members = await TeamMember.find();
        console.log('Members:', members);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
