
const express = require("express");

const router = express.Router()

const { authUser } = require("../middlewares/authMiddleware");
const { adminUser } = require("../middlewares/adminMiddleware");
const { clickTracking, getAllClickTracking } = require("../controllers/users/tickerController");


router.post("/track-click", authUser, clickTracking);
router.get("/all-click-tracking", adminUser, getAllClickTracking);

module.exports = router