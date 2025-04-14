const { adminDetailsModel } = require("../models/adminSchema");
const bcrypt = require("bcrypt");
const { adminToken } = require("../utilities/token");
const { userDetailsModel } = require("../models/userSchema");
const s3Client = require("../utilities/awsConfig");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

const adminLoginDetails = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await adminDetailsModel.findOne({ userName });
    if (!user) {
      return res.status(400).json({ error: "Invalid User Name!." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password!" });
    }

    const token = adminToken({ _id: user._id, userName: user.userName });

    res.status(200).json({
      message: "Successfully Logged In",
      user,
      token,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userDetailsModel.find({});
    const usersCount = users.length;

    res.status(200).json({ message: "Users retrieved successfully", usersCount, users });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to fetch users", error: error.message });
  }
};

const streamUserDocument = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await userDetailsModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({
          error: "This Email address is not registered. Please sign up first!",
        });
    }

    if (!user.documents) {
      return res
        .status(404)
        .json({
          error: "User did not upload documents. Ask Him to upload first!",
        });
    }

    const fullUrl = user.documents;

    const key = decodeURIComponent(
      fullUrl.replace(
        "https://kv-files-upload.s3.ap-south-1.amazonaws.com/",
        ""
      )
    );

    const command = new GetObjectCommand({
      Bucket: "kv-files-upload",
      Key: key,
    });

    const data = await s3Client.send(command);

    // Set proper content type
    res.setHeader("Content-Type", "image/jpeg"); // or 'application/pdf' if document is a PDF
    res.setHeader("Content-Disposition", "inline");

    // Pipe the stream to the browser
    data.Body.pipe(res);
  } catch (err) {
    console.error("Stream error:", err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  adminLoginDetails,
  getAllUsers,
  streamUserDocument,
};
