
const express = require("express");

const router = express.Router()

const { adminUser } = require("../middlewares/adminMiddleware");
const createAdmin = require("../scripts/createAdmin");
const { adminLoginDetails, getAllUsers, streamUserDocument, getCountOfFieldsDetails } = require("../controllers/admin/adminController");
const { approveProfileStatus, rejectProfileStatus, deleteProfileStatus, blockUserProfile } = require("../controllers/admin/adminProfileStatusController");



router.post("/login", adminLoginDetails);

router.get('/all-users', getAllUsers);

router.get("/stream-document",adminUser, streamUserDocument);

router.get("/fields-count", adminUser, getCountOfFieldsDetails)

router.patch("/approve-profile/:id", adminUser, approveProfileStatus)

router.patch("/reject-profile/:id", adminUser, rejectProfileStatus)

router.delete("/delete-profile/:id", adminUser, deleteProfileStatus)

router.patch("/block-profile/:id", adminUser, blockUserProfile)


module.exports = router;