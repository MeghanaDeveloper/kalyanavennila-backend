
const express = require("express");

const router = express.Router()

const { authUser } = require("../middlewares/authMiddleware");
const { updateProfileDetails } = require("../controllers/userControllers");
const { uploadProfileImage, updateProfileImage, deleteProfileImage, uploadDocuments, updateDocuments, deleteDocuments } = require("../controllers/profileController");
const { uploadImages, uploadFiles } = require("../utilities/multer");
const { multerMiddleware } = require("../middlewares/multerMiddleware");

router.patch('/update-profile', authUser, updateProfileDetails)

router.post('/upload-profile-image', authUser, uploadImages.single('profile-pic'), multerMiddleware , uploadProfileImage);

router.patch('/update-profile-image', authUser, uploadImages.single('profile-pic'), multerMiddleware, updateProfileImage);

router.delete("/delete-profile-image", authUser, deleteProfileImage);

router.post("/upload-documents", authUser, uploadFiles.single('proof-document'), multerMiddleware, uploadDocuments);

router.patch("/update-documents", authUser, uploadFiles.single('proof-document'), multerMiddleware, updateDocuments);

router.delete("/delete-documents", authUser, multerMiddleware, deleteDocuments);



module.exports = router