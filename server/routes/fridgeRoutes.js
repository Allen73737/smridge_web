const express = require('express');
const router = express.Router();
const {
    getFridgeStatuses,
    getFridgeStatus,
    updateFridgeStatus,
} = require('../controllers/fridgeController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.route('/').get(protect, admin, getFridgeStatuses);
router.route('/update').put(protect, updateFridgeStatus);
router.route('/:userId').get(protect, getFridgeStatus);

module.exports = router;
