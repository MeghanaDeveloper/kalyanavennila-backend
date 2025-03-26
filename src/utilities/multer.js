
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('./awsConfig');
require('dotenv').config();


const uploadImages = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET_NAME, 
        metadata: (req, file, cb) => {
            console.log(file)
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `profile-images/${Date.now()}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 10 * 1024 }, // 10kb
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
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
        key: (req, file, cb) => {
            cb(null, `proof-documents/${Date.now()}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, and PDF files are allowed!"), false);
        }
    }
}).array("documents", 5); 


module.exports = {
    uploadImages,
    uploadFiles
};
