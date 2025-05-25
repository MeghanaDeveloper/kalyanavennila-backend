
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('./awsConfig');
require('dotenv').config();

export const MAX_SIZE = 50 * 1024 * 1024;

const uploadImages = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET_NAME, 
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `profile-images/${Date.now()}-${file.originalname}`);
        }
    }),
     limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
            cb(null, true);
        } else {
            cb(new Error("Only JPG files are allowed!"), false);
        }
    }

});

//documents
const uploadFiles = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        contentDisposition: 'inline',
        key: (req, file, cb) => {
            cb(null, `proof-documents/${Date.now()}-${file.originalname}`);
        }
    }),
  limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
            cb(null, true);
        } else {
            cb(new Error("Only JPG files are allowed!"), false);
        }
    }
}); 


module.exports = {
    uploadImages,
    uploadFiles
};
