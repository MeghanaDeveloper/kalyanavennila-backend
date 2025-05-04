const { clickTrackingModel } = require("../../models/clickTrackingSchema");
const { userDetailsModel } = require("../../models/userSchema");
const {
  sendProfileRejectedEmail,
  sendProfileApprovedEmail,
  sendProfileBlockedEmail,
} = require("../../utilities/emailServices");

//approve
const approveProfileStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userDetailsModel.findById(id);
    if (!user) {
      return res.status(404).json({error: "This Email address is not registered. Please sign up first!"});
    }

    if (user.isProfileStatus === "Approved") {
      return res.status(404).json({ error: "Profile already Approved!" });
    }

    user.isProfileStatus = "Approved";
    user.rejectionReason = null
    user.blockedReason = null
    await user.save();

    res.status(200).json({ message: "Profile approved successfully!", user });

    const fullName = `${user.surName || ""} ${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();

    setImmediate(async () => {
      await sendProfileApprovedEmail(user.email, fullName);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//reject
const rejectProfileStatus = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const user = await userDetailsModel.findById(id);

    if (!user) {
      return res.status(404).json({error: "This Email address is not registered. Please sign up first!"});
    }

    if (user.isProfileStatus === "Rejected") {
      return res.status(404).json({ error: "Profile already rejected!" });
    }

    // Reject only if status is pending
    user.isProfileStatus = "Rejected";
    user.rejectionReason = reason;
    user.blockedReason = null
    await user.save();

    res.status(200).json({ message: "Profile rejected successfully!", user });

    const fullName = `${user.surName || ""} ${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();

    setImmediate(async () => {
      await sendProfileRejectedEmail(user.email, fullName, reason);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//delete
const deleteProfileStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userDetailsModel.findById(id);
    if (!user) {
      return res.status(404).json({error: "This Email address is not registered. Please sign up first!"});
    }

    await userDetailsModel.findByIdAndDelete(id);

    // const trackingData = await clickTrackingModel.find({ userId: id });
    // if (trackingData.length > 0) {
    //   await clickTrackingModel.deleteMany({ userId: id });
    // }

    res.status(200).json({message: "User deleted successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//block
const blockUserProfile = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const user = await userDetailsModel.findById(id);

    if (!user) {
      return res.status(404).json({error: "This Email address is not registered. Please sign up first!"});
    }

    if (user.isProfileStatus === "Blocked") {
      return res.status(404).json({ error: "Your Profile already Blocked!" });
    }

    user.isProfileStatus = "Blocked";
    user.blockedReason = reason;
    await user.save();

    res.status(200).json({ message: "Profile Blocked successfully!", user });

    const fullName = `${user.surName || ""} ${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();

    setImmediate(async () => {
      await sendProfileBlockedEmail(user.email, fullName, reason);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  approveProfileStatus,
  deleteProfileStatus,
  rejectProfileStatus,
  blockUserProfile
};
