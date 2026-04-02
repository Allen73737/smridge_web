const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'admin@smridge.com' });
    if (!user) { console.log('Admin not found'); process.exit(); }

    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('--- PASSWORD COMPARISON TEST ---');
    console.log('Stored Hash:', user.password);
    console.log('Test with "admin123":', isMatch ? 'MATCH' : 'FAIL');
    process.exit();
}
test();
