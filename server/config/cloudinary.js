const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'smridge_apks',
        resource_type: 'raw', // Important for .apk and .ipa files
        public_id: (req, file) => {
            const ext = file.originalname.split('.').pop();
            const name = file.originalname.split('.').shift();
            return `${name}-${Date.now()}.${ext}`;
        },
    },
});

module.exports = { cloudinary, storage };
