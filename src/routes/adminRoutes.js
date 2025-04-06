
const express = require("express");

const router = express.Router()

const { adminLoginDetails } = require("../controllers/adminController");


router.post("/login", adminLoginDetails);


module.exports = router;