const { userDetailsModel } = require("../../models/userHooks");
const {
  sendOtpToEmail,
  sendContactMessagesToEmail,
} = require("../../utilities/emailServices");
const { generateOtp } = require("../../utilities/generators");
const { createToken } = require("../../utilities/token");
const { userValidation } = require("../../validations/userValidations");
const bcrypt = require("bcrypt");

const userSignupDetails = async (req, res) => {
  const {
    accountCreatedBy,
    gender,
    email,
    mobile,
    surName,
    firstName,
    lastName,
    motherTongue,
    religion,
  } = req.body;

  try {
    const { error } = userValidation.validate(req.body, { abortEarly: false });
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((err) => err.message) });
    }

    const existingEmail = await userDetailsModel.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "This Email has already been registered" });
    }

    const existingMobile = await userDetailsModel.findOne({ mobile });
    if (existingMobile) {
      return res
        .status(400)
        .json({ error: "This Mobile number is already registered" });
    }

    const otp = await generateOtp();

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const signUpDetails = await userDetailsModel.create({
      accountCreatedBy,
      gender,
      email,
      mobile,
      surName,
      firstName,
      lastName,
      motherTongue,
      religion,
      verifyOtp: otp,
      otpExpiresAt,
      isUserVerified: false,
    });

    const token = createToken({
      _id: signUpDetails._id,
      email: signUpDetails.email,
      mobile: signUpDetails.mobile,
    });

    res.status(200).json({
      message: "Signup successful",
      signUpDetails,
      token,
    });

    setImmediate(async () => {
      await sendOtpToEmail(email, otp);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//user login
const userLoginDetails = async (req, res) => {
  const { accountId, password } = req.body;

  try {
    const user = await userDetailsModel.findOne({ accountId });
    if (!user) {
      return res
        .status(400)
        .json({
          error: "Invalid Account ID! No user found with this account ID.",
        });
    }

    if (!user.isUserVerified) {
      return res
        .status(400)
        .json({
          error:
            "Account not verified. Please verify your OTP before logging in.",
        });
    }

    const emailMatches = await userDetailsModel.findOne({
      accountId,
      email: user.email,
    });
    if (!emailMatches) {
      return res.status(400).json({ error: "Invalid Account ID" });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({
          error:
            "You have not set a password. Please create a password before logging in.",
        });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password!" });
    }

    if (user.isProfileStatus === "Blocked") {
      return res.status(400).json({
        error:
          "Your account has been blocked by the admin. Please check your email for details. For any concerns, feel free to contact our support team.",
      });
    }

    const token = createToken({
      _id: user._id,
      email: user.email,
      mobile: user.mobile,
      accountId: user.accountId,
    });

    const profileDetails = {
      accountId: user.accountId,
      surName: user.surName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      motherTongue: user.motherTongue,
      religion: user.religion,
    };

    res.status(200).json({
      message: "Successfully Logged In",
      profileDetails,
      token,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//contact form
const userContactMessages = async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    setImmediate(async () => {
      await sendContactMessagesToEmail(name, email, phone, message);
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to send message" });
  }
};

module.exports = {
  userSignupDetails,
  userLoginDetails,
  userContactMessages,
};
