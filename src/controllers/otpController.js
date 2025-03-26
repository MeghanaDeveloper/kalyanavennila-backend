const { userDetailsModel } = require("../models/userSchema");
const { sendAccountIdToEmail, sendOtpToEmail } = require("../utilities/emailServices");
const { generateAccountId, generateOtp } = require("../utilities/generators");


//verify otp
const OTPVerification = async (req, res) => {
    const { otp } = req.body;
    const { email } = req.userDetails; 
    try {
        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        if (new Date() > new Date(user.otpExpiresAt)) {
            return res.status(400).json({ error: "OTP has expired! Please request a new OTP." });
        }

        if (user.verifyOtp !== otp) {
            return res.status(400).json({ error: "Invalid OTP!" });
        }

        user.isUserVerified = true;
        user.verifyOtp = null;  
        user.otpExpiresAt = null;

        if (!user.accountId) {
            let newAccountId;
            let isUnique = false;

            while (!isUnique) {
                newAccountId = await generateAccountId();
                const existingUser = await userDetailsModel.findOne({ accountId: newAccountId });
                if (!existingUser) {
                    isUnique = true;
                }
            }
            user.accountId = newAccountId;
        }
       
    
        await user.save();

        res.status(200).json({ message: "OTP verified successfully!", accountId:user.accountId});

        setImmediate(async () => {
            await sendAccountIdToEmail(email, user.accountId);
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


//resend otp
const resendOtp = async (req, res) => {
    const { email } = req.userDetails;

    try {
        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        const resentOtp = await generateOtp();

        user.verifyOtp = resentOtp
        user.isUserVerified = false;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 
        await user.save();
        
        res.status(200).json({ message: "OTP has been resent to your email.", otp: resentOtp });

        setImmediate(async () => {
            await sendOtpToEmail(email, resentOtp)
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = {
    OTPVerification,
    resendOtp,
} 