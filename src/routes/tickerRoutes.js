
const express = require("express");

const router = express.Router()

const { authUser } = require("../middlewares/authMiddleware");
const { clickTracking, getAllClickTracking } = require("../controllers/tickerController");
const { adminUser } = require("../middlewares/adminMiddleware");


router.post("/track-click", authUser, clickTracking);
router.get("/all-click-tracking", adminUser, getAllClickTracking);

module.exports = router