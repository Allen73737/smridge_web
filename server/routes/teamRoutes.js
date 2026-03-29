const express = require('express');
const router = express.Router();
const { getTeam, updateMember } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.get('/', getTeam);
router.put('/:id', protect, admin, updateMember);

module.exports = router;
