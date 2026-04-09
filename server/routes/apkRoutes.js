const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    uploadAPK,
    getLatestAPK,
    getAllAPKs,
    getAppHistory,
    deleteAPK,
    setLatestAPK,
    generateSignature,
    registerAPK,
} = require('../controllers/apkController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// Multer Config
const { storage: cloudinaryStorage } = require('../config/cloudinary');

// Multer Storage Configuration (Local Fallback)
const localStorage = multer.diskStorage({
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

function checkFileType(file, cb) {
    const filetypes = /apk|ipa|ios|android|zip/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid App File Format! (Allowing .apk, .ipa, .zip)');
    }
}

// Use Cloudinary for primary storage
const upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB Limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/upload', protect, admin, upload.single('file'), uploadAPK);
router.get('/sign', protect, admin, generateSignature);
router.post('/register', protect, admin, registerAPK);
router.get('/all', protect, admin, getAllAPKs);
router.get('/latest/:platform', getLatestAPK);
router.get('/history/:platform', getAppHistory);
router.put('/:id/latest', protect, admin, setLatestAPK);
router.delete('/:id', protect, admin, deleteAPK);

module.exports = router;
