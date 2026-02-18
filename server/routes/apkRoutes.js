const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    uploadAPK,
    getLatestAPK,
    getAllAPKs,
} = require('../controllers/apkController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// Multer Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

function checkFileType(file, cb) {
    const filetypes = /apk|android-package-archive/; // Simplified check
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // const mimetype = filetypes.test(file.mimetype); // mimetype varies, rely on ext for now

    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: APK Files Only!');
    }
}

router.route('/upload').post(protect, admin, upload.single('apk'), uploadAPK);
router.route('/latest').get(protect, getLatestAPK);
router.route('/all').get(protect, admin, getAllAPKs);

module.exports = router;
