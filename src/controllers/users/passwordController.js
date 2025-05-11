const { userDetailsModel } = require("../../models/userHooks");
const { sendTemporaryPasswordToEmail } = require("../../utilities/emailServices");
const { generateTempPassword } = require("../../utilities/generators");
const createToken = require("../../utilities/token");
const { passwordValidation } = require("../../validations/userValidations");
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

        await user.save()

        const token = createToken({ _id: user._id, email: user.email, mobile: user.mobile, accountId: user.accountId });

    res.status(200).json({ message: "Temporary Password sent to email for password reset" , temporaryPassword: user.temporaryPassword, token});

       setImmediate(async () => {
        await sendTemporaryPasswordToEmail(email, password)
            });

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
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createPassword,
    forgotPassword,
    resetPassword
}