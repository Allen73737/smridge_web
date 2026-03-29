const TeamMember = require('../models/Team');
const fs = require('fs');
const path = require('path');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeam = async (req, res) => {
    try {
        const team = await TeamMember.find({ isActive: true }).sort('order');
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a team member
// @route   PUT /api/team/:id
// @access  Private/Admin
const updateMember = async (req, res) => {
    try {
        const { name, role, isActive, order, bio, gmail, instagram, photoBase64 } = req.body;
        const member = await TeamMember.findById(req.params.id);

        if (member) {
            member.name = name || member.name;
            member.role = role || member.role;
            member.isActive = isActive !== undefined ? isActive : member.isActive;
            member.order = order !== undefined ? order : member.order;
            
            if (bio !== undefined) member.bio = bio;
            if (gmail !== undefined) member.gmail = gmail;
            if (instagram !== undefined) member.instagram = instagram;

            if (photoBase64) {
               const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
               const buffer = Buffer.from(base64Data, 'base64');
               const publicDir = path.join(__dirname, '../../smridge_Web/public/team');
               if (!fs.existsSync(publicDir)){
                   fs.mkdirSync(publicDir, { recursive: true });
               }
               const fileName = `founder_${member._id}.jpg`;
               fs.writeFileSync(path.join(publicDir, fileName), buffer);
               member.photo = `/team/${fileName}?t=${Date.now()}`;
            }

            const updatedMember = await member.save();
            res.json(updatedMember);
        } else {
            res.status(404).json({ message: 'Member not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeam,
    updateMember
};

