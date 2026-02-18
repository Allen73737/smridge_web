const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    blockUser,
    updateUserRole,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.route('/').get(protect, admin, getUsers);
router
    .route('/:id')
    .delete(protect, admin, deleteUser);
router.route('/block/:id').put(protect, admin, blockUser);
router.route('/role/:id').put(protect, admin, updateUserRole);

module.exports = router;
