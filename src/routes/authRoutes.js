
const express = require("express")

const router = express.Router()

const { userSignupDetails, userLoginDetails, getUserByEmail} = require("../controllers/userControllers")
const { authUser } = require("../middlewares/authMiddleware")
const { OTPVerification, resendOtp } = require("../controllers/otpController")
const { createPassword, forgotPassword, resetPassword } = require("../controllers/passwordController")


router.post('/registration', userSignupDetails)

router.post('/verify-otp', authUser, OTPVerification)

router.post('/resend-otp', authUser, resendOtp)

router.post('/create-password', authUser, createPassword)

router.post('/login', userLoginDetails)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password', authUser, resetPassword)

router.get('/user', authUser, getUserByEmail)

module.exports = router