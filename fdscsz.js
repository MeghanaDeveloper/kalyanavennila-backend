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

        const emailResponse = await sendAccountIdToEmail(email, user.accountId);
        if (!emailResponse) {
            return res.status(400).json({ error: "Failed to send OTP. Try again later." });
        }

        res.status(200).json({ message: "OTP verified successfully!", accountId:user.accountId});

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

        const isSent = await sendOtpToEmail(email, resentOtp);
        if (!isSent) {
            return res.status(400).json({ error: "Failed to send OTP. Try again later." });
        }
        
        res.status(200).json({ message: "OTP has been resent to your email.", otp: resentOtp });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = {
    OTPVerification,
    resendOtp,
} 
const { userDetailsModel } = require("../models/userSchema");
const { sendTemporaryPasswordToEmail } = require("../utilities/emailServices");
const { generateTempPassword } = require("../utilities/generators");
const createToken = require("../utilities/token");
const { passwordValidation } = require("../validations/userValidations");
const bcrypt = require('bcrypt')


const createPassword = async (req, res) => {
    const { accountId, password, confirmPassword } = req.body; 
    const { email } = req.userDetails; 
    try {

        const { error } = passwordValidation.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ error: error.details.map(err => err.message) });
        }

        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        if (!user.isUserVerified) { 
            return res.status(400).json({ error: "Account not verified. Please verify your OTP before creating password." }); 
        }

        if (accountId !== user.accountId) {
            return res.status(400).json({ error: " Invalid AccountId !" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        await user.save();

    res.status(200).json({ message: "Password created successfully! " });

} catch (error) {
    res.status(400).json({ error: error.message });
}
};


//forgot
const forgotPassword = async (req, res) => {
    const { accountId, email } = req.body; 
    try {

        const user = await userDetailsModel.findOne({ email, accountId });
        if (!user) {
            return res.status(400).json({ error: "Invalid Email or Account Id!" });
        }

        if (!user.isUserVerified) { 
            return res.status(400).json({ error: "Account not verified. Please verify your OTP before logging in." }); 
        }

        const password = generateTempPassword()

        user.temporaryPassword = password

        await sendTemporaryPasswordToEmail(email, password)

        await user.save()

        const token = createToken({ _id: user._id, email: user.email, mobile: user.mobile, accountId: user.accountId });

    res.status(200).json({ message: "Temporary Password sent to email for password reset" , temporaryPassword: user.temporaryPassword, token});

} catch (error) {
    res.status(400).json({ error: error.message });
}
};

//reset password
const resetPassword = async (req, res) => {
    const { email } = req.userDetails
    const { accountId, temporaryPassword, newPassword, confirmPassword } = req.body;
    try {
        const { error } = passwordValidation.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ error: error.details.map(err => err.message) });
        }
        
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

        if (accountId !== user.accountId) {
            return res.status(400).json({ error: "Invalid AccountId !" });
        }

        if (temporaryPassword !== user.temporaryPassword) {
            return res.status(400).json({ error: "Invalid Temporary Password!" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: " passwords do not match!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: "Password reset successfully! You can now log in with your new password." });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPassword,
    forgotPassword,
    resetPassword
}
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

        const isSent = await sendOtpToEmail(email, otp);
        if (!isSent) {
            return res.status(400).json({ error: "Failed to send OTP. Try again later." });
        }
        
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const signUpDetails = await userDetailsModel.create({accountCreatedBy, gender, email, mobile, fullName, motherTongue, religion,  verifyOtp: otp, otpExpiresAt,isUserVerified: false
        })

        const token = createToken({ _id: signUpDetails._id, email: signUpDetails.email, mobile: signUpDetails.mobile });

        res.status(200).json({
            message: 'Signup successful',
            signUpDetails,
            token
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

//update profile
const updateUserDetails = async (req, res) => {
    const { email } = req.userDetails;
    const updateFields = req.body;

    try {
        const user = await userDetailsModel.findById({email});
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

const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    accountId:{type:String , unique : true, sparse:true },
    accountCreatedBy: { type: String, required: true, enum:['Myself','Parent','Guardian','Sister','Brother','Relative','Friend'] },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    motherTongue: { type: String, required: true },
    religion: { type: String, required: true },
    verifyOtp: { type:String},
    otpExpiresAt: { type: Date },
    isUserVerified:{ type: Boolean, default:false},
    password:{ type: String },
    temporaryPassword:{type:String}
    // languages:{ type:[String]},
    // caste:{ type: String },
    // subCaste:{ type: String },
    // dateOfBirth: { type: Date },
    // applicantEducation: { type: String, enum: ['Professional Degree', 'Post Graduation', 'Graduation', 'Diploma', 'Under Grad'] },
    // applicantJobType: { type: String, enum: ['Govt', 'MNC', 'Private', 'NRI', 'Business', 'Others'] },
    // lookingFor: { type: String, enum: ['Man', 'Woman'] },
    // patnerAge: { type: [String], enum: ['21-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55'] },
},
{ timestamps: true }  
);


const userDetailsModel = new mongoose.model("UserDetails", userDetailsSchema)

module.exports = {
    userDetailsModel
}  

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.GODADDY_SMTP_HOST, 
    port: process.env.GODADDY_SMTP_PORT, 
    secure: true, 
    pool: true, 
    maxConnections: 5, 
    maxMessages: 100, 
    rateLimit: 2 ,
    auth: {
        user: process.env.GODADDY_EMAIL,
        pass: process.env.GODADDY_PASSWORD
    }
});


const sendOtpToEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.GODADDY_EMAIL, 
        to: email,
        subject: "sending Otp for Kalyana Vennila - Account Email Verification",
        html: 
        <div style=" padding: 10px">
            <h2 style="color: #0557A2;">Kalyana Vennila - OTP Verification</h2>
            <p>Dear User,</p>
            <p>Thank you for registering with <strong>Kalyana Vennila</strong>. To verify your email, please use the OTP below:</p>
            <div style="padding: 10px; font-size: 20px;  font-weight: bold">
                ${otp}
            </div>
            <p>This OTP is valid for only <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
            <p>If you did not request this verification, you can ignore this email.</p>
            <p>Best Regards,</p>
            <p><strong>Kalyana Vennila Support Team</strong></p>
        </div>
    
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(info)
        return {
            success: true,
            message: "Email sent successfully!",
            messageId: info.messageId
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to send email.",
            error: error.message
        };
    }
  };

const sendAccountIdToEmail = async (email, accountId) => {
    const mailOptions = {
        from: process.env.GODADDY_EMAIL, 
        to: email,
        subject: "Kalyana Vennila - Account Registration Successful",
        html: 
        <div style=" padding: 10px">
            <h2>Welcome to Kalyana Vennila!</h2>
            <p>Dear User,</p>
            <p>Thank you for registering with <strong>Kalyana Vennila</strong>. Your account has been successfully created.</p>
            <p><strong>Your Account ID:</strong></p>
            <div style="padding: 10px; font-size: 18px;  font-weight: bold">
                ${accountId}
            </div>
            <p>Please keep your Account ID safe for future logins.</p>
            <p className=" text-red-500 font-semibold">
  ⚠️ Important: Please **save your Account ID**. It will not be shown again!
</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best Regards,</p>
            <p><strong>Kalyana Vennila Support Team</strong></p>
        </div>
    

    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(info)
        return {
            success: true,
            message: "Email sent successfully!",
            messageId: info.messageId
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to send email.",
            error: error.message
        };
    }
  };


  const sendTemporaryPasswordToEmail = async (email, password) => {
    const mailOptions = {
        from: process.env.GODADDY_EMAIL, 
        to: email,
        subject: "Kalyana Vennila - Reset Password",
        html: 
            <div style=" padding: 10px">
                <h2 style="color: #0557A2;">Kalyana Vennila - Password Reset</h2>
                <p>Dear User,</p>
                <p>You have requested to reset your password. Please use the temporary password below to log in and update your password:</p>
                <div style=" padding: 10px;  font-size: 24px; font-weight: bold">
                    ${password}
                </div>
                <p>For security reasons, we recommend updating your password immediately after logging in.</p>
                <p>If you did not request this reset, please ignore this email.</p>
                <p>Thank you,</p>
                <p><strong>Kalyana Vennila Support Team</strong></p>
            </div>
        
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            message: "Temporary password email sent successfully!",
            messageId: info.messageId
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to send email.",
            error: error.message
        };
    }
};


module.exports = {
    sendOtpToEmail,
    sendAccountIdToEmail,
    sendTemporaryPasswordToEmail
  } 

//generate otp
const generateOtp = async () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//account id
const generateAccountId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
    return KV${randomNum}; // Example: KV738291
};

//temporary password
const generateTempPassword = () => {
    const characters = "abcdefghijklmnopqrstuvwxyz"; // Only small letters
    let tempPassword = "";

    for (let i = 0; i < 10; i++) {
        tempPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return tempPassword;
}


module.exports = {
    generateAccountId,
    generateOtp,
    generateTempPassword
} 
require("dotenv").config();

const express = require("express")
const cors = require('cors')
const bodyParser = require('body-parser');

const app= express()

const port = process.env.PORT || 8800

//middleware    
app.use(bodyParser.json());
app.use(express.json());
app.use(cors())  

//db connection
require('./db/connection')

//routes
const authRoutes = require('./routes/authRoutes')

app.use('/api/auth', authRoutes )

app.get("/", (req,res) => {
    res.send('hello world')
})


app.listen(port, async () => {
    console.log(server is running at port number ${port})
})