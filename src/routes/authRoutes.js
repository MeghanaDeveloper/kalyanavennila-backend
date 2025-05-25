
const express = require("express")

const router = express.Router()

const { authUser } = require("../middlewares/authMiddleware")
const { userSignupDetails, userLoginDetails, userContactMessages } = require("../controllers/users/userControllers")
const { OTPVerification, resendOtp } = require("../controllers/users/otpController")
const { createPassword, forgotPassword, resetPassword } = require("../controllers/users/passwordController")

router.post('/user-contact', userContactMessages)

router.post('/registration', userSignupDetails)

router.post('/verify-otp', authUser, OTPVerification)

router.post('/resend-otp', authUser, resendOtp)

router.post('/create-password', authUser, createPassword)

router.post('/login', userLoginDetails)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password', authUser, resetPassword)

module.exports = router