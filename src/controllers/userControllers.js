 const { userDetailsModel } = require("../models/userSchema");
const { sendOtpToEmail } = require("../utilities/emailServices");
const { generateOtp } = require("../utilities/generators");
const createToken = require("../utilities/token");
const { userValidation } = require("../validations/userValidations");
const bcrypt = require('bcrypt')


const userSignupDetails = async (req, res) => {
    const {accountCreatedBy, gender, email, mobile, fullName, motherTongue, religion} = req.body

    try {

        const { error } = userValidation.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ error: error.details.map(err => err.message) });
        }

        const existingEmail = await userDetailsModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "This Email has already been registered" });
        }

        const existingMobile = await userDetailsModel.findOne({ mobile });
        if (existingMobile) {
            return res.status(400).json({ error: "This Mobile number is already registered" });
        }

        const otp = await generateOtp() 

        // const isSent = await sendOtpToEmail(email, otp);
        // if (!isSent) {
        //     return res.status(400).json({ error: "Failed to send OTP. Try again later." });
        // }
        
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const signUpDetails = await userDetailsModel.create({accountCreatedBy, gender, email, mobile, fullName, motherTongue, religion,  verifyOtp: otp, otpExpiresAt,isUserVerified: false
        })

        const token = createToken({ _id: signUpDetails._id, email: signUpDetails.email, mobile: signUpDetails.mobile });

        res.status(200).json({
            message: 'Signup successful',
            signUpDetails,
            token
        })

        setImmediate(async () => {
            await sendOtpToEmail(email, otp);
        });

    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

//update profile
const updateUserDetails = async (req, res) => {
    const { email } = req.userDetails;
    const updateFields = req.body;

    try {
        const user = await userDetailsModel.findOne({email});
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        Object.keys(updateFields).forEach((key) => {
            if (updateFields[key] !== undefined) {
                user[key] = updateFields[key];
            }
        });

        await user.save();
        res.status(200).json({ message: "User details updated successfully", user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//user login
const userLoginDetails = async (req, res) => {
    const { accountId, password } = req.body;
    const { email } = req.userDetails
    try {

        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "This Email address is not registered. Please sign up first!" });
        }
        
        if (!user.isUserVerified) { 
            return res.status(400).json({ error: "Account not verified. Please verify your OTP before logging in." }); 
        }

        if (!user.accountId) {
            return res.status(400).json({ error: " AccountId is not generated !" });
        }

        if (!user.password) {
            return res.status(400).json({ error: "You have not set a password. Please create a password before logging in." });
        }

        if (accountId !== user.accountId) {
            return res.status(400).json({ error: "Invalid AccountId !" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Incorrect password!" }); 
        }

        const token = createToken({ _id: user._id, email: user.email, mobile:user.mobile, accountId: user.accountId });

        const { otp, otpExpiresAt, verifyOtp, password: _, ...profileDetails } = user.toObject();

         res.status(200).json({
            message: "Successfully Logged In",
            profileDetails,
            token
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports={
    userSignupDetails,
    userLoginDetails,
    updateUserDetails
} 