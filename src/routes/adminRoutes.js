
const express = require("express");

const router = express.Router()

const { adminLoginDetails, getAllUsers, streamUserDocument } = require("../controllers/adminController");
const { adminUser } = require("../middlewares/adminMiddleware");
const { approveProfileStatus, rejectProfileStatus, deleteProfileStatus } = require("../controllers/adminProfileStatusController");


router.post("/login", adminLoginDetails);

router.get('/all-users', getAllUsers);

router.get("/stream-document", streamUserDocument);

router.patch("/approve-profile/:id", adminUser, approveProfileStatus)

router.patch("/reject-profile/:id", adminUser, rejectProfileStatus)

router.delete("/delete-profile/:id", adminUser, deleteProfileStatus)


module.exports = router;