const express = require('express');
const router = express.Router();
const {
    getThresholds,
    updateThresholds,
} = require('../controllers/thresholdController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.route('/').get(protect, getThresholds);
router.route('/update').put(protect, admin, updateThresholds);

module.exports = router;
