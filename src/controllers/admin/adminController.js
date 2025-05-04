const { adminDetailsModel } = require("../../models/adminSchema");
const bcrypt = require("bcrypt");
const { adminToken } = require("../../utilities/token");
const { userDetailsModel } = require("../../models/userSchema");
const s3Client = require("../../utilities/awsConfig");
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

    res
      .status(200)
      .json({ message: "Users retrieved successfully", usersCount, users });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to fetch users", error: error.message });
  }
};

//
const streamUserDocument = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await userDetailsModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "This Email address is not registered. Please sign up first!",
      });
    }

    if (!user.documents) {
      return res.status(400).json({
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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//
const getCountOfFieldsDetails = async (req, res) => {
  try {
    // 1. Count total users
    const totalUsers = await userDetailsModel.countDocuments();

    // 2. Count users by isProfileStatus
    const statusCounts = await userDetailsModel.aggregate([
      {
        $group: {
          _id: "$isProfileStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // 3. Group by Religion
    const religionCounts = await userDetailsModel.aggregate([
      {
        $group: {
          _id: "$religion",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Group by Caste
    const casteCounts = await userDetailsModel.aggregate([
      {
        $group: {
          _id: "$caste",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Group by Job Type
    const jobCounts = await userDetailsModel.aggregate([
      {
        $addFields: {
          jobGroup: {
            $cond: [
              { $eq: ["$jobType", "Others"] },
              "$otherJobType",
              "$jobType",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$jobGroup",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Group by mother tongue Type
    const motherTongueCounts = await userDetailsModel.aggregate([
      {
        $group: {
          _id: "$motherTongue",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      message: "User stats report generated",
      totalUsers,
      pendingProfiles: statusMap["Pending"] || 0,
      approvedProfiles: statusMap["Approved"] || 0,
      rejectedProfiles: statusMap["Rejected"] || 0,
      religion: religionCounts,
      caste: casteCounts,
      job: jobCounts,
      motherTongue: motherTongueCounts,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error generating report", error: error.message });
  }
};

module.exports = {
  adminLoginDetails,
  getAllUsers,
  streamUserDocument,
  getCountOfFieldsDetails,
};
