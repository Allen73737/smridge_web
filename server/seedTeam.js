const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TeamMember = require('./models/Team');

dotenv.config();

const members = [
    {
        name: 'Siddharth',
        role: 'Founder',
        image: '/src/assets/team/member1.png',
        photo: '/src/assets/team/member1_real.jpg',
        order: 1
    },
    {
        name: 'Aditya',
        role: 'Founder',
        image: '/src/assets/team/member2.png',
        photo: '/src/assets/team/member2_real.jpg',
        order: 2
    },
    {
        name: 'Tushar',
        role: 'Founder',
        image: '/src/assets/team/member3.png',
        photo: '/src/assets/team/member3_real.jpg',
        order: 3
    },
    {
        name: 'Yash',
        role: 'Founder',
        image: '/src/assets/team/member4.png',
        photo: '/src/assets/team/member4_real.jpg',
        order: 4
    }
];

const seedTeam = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding Team...');

        await TeamMember.deleteMany();
        console.log('Old team members removed.');

        await TeamMember.insertMany(members);
        console.log('New team members (Founders) seeded successfully.');

        process.exit();
    } catch (error) {
        console.error('Error seeding team:', error);
        process.exit(1);
    }
};

seedTeam();
