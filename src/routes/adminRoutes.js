
const express = require("express");

const router = express.Router()

const { adminLoginDetails, getAllUsers, streamUserDocument, getCountOfFieldsDetails } = require("../controllers/adminController");
const { adminUser } = require("../middlewares/adminMiddleware");
const { approveProfileStatus, rejectProfileStatus, deleteProfileStatus } = require("../controllers/adminProfileStatusController");
const createAdmin = require("../scripts/createAdmin");

router.post("/create-admin", createAdmin);

router.post("/login", adminLoginDetails);

router.get('/all-users', getAllUsers);

router.get("/stream-document", streamUserDocument);

router.get("/fields-count", getCountOfFieldsDetails)

router.patch("/approve-profile/:id", adminUser, approveProfileStatus)

router.patch("/reject-profile/:id", adminUser, rejectProfileStatus)

router.delete("/delete-profile/:id", adminUser, deleteProfileStatus)


module.exports = router;