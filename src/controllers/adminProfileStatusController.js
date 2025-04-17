const { clickTrackingModel } = require("../models/clickTrackingSchema");
const { userDetailsModel } = require("../models/userSchema");
const {
  sendProfileRejectedEmail,
  sendProfileApprovedEmail,
} = require("../utilities/emailServices");

//approve
const approveProfileStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userDetailsModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({
          error: "This Email address is not registered. Please sign up first!",
        });
    }

    if (user.isProfileStatus === "Approved") {
      return res.status(404).json({ error: "Profile already Approved!" });
    }

    if (user.isProfileStatus === "Rejected") {
      return res
        .status(404)
        .json({ error: "Rejected profile can't be Approved!" });
    }

    // Update the profile status to 'approved'
    if (user.isProfileStatus === "Rejected") {
      return res
        .status(404)
        .json({ error: "Rejected profile can't be Approved!" });
    }

    user.isProfileStatus = "Approved";
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

//
const rejectProfileStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userDetailsModel.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({
          error: "This Email address is not registered. Please sign up first!",
        });
    }

    // Already rejected
    if (user.isProfileStatus === "Rejected") {
      return res.status(404).json({ error: "Profile already rejected!" });
    }

    // Approved profiles can't be rejected
    if (user.isProfileStatus === "Approved") {
      return res
        .status(404)
        .json({ error: "Approved profile can't be rejected!" });
    }

    // Reject only if status is pending
    user.isProfileStatus = "Rejected";
    await user.save();

    res.status(200).json({ message: "Profile rejected successfully!", user });

    const fullName = `${user.surName || ""} ${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();

    setImmediate(async () => {
      await sendProfileRejectedEmail(user.email, fullName);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//
const deleteProfileStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userDetailsModel.findById(id);
    if (!user) {
      return res.status(404).json({error: "This Email address is not registered. Please sign up first!"});
    }

    await userDetailsModel.findByIdAndDelete(id);

    const trackingData = await clickTrackingModel.find({ userId: id });
    if (trackingData.length > 0) {
      await clickTrackingModel.deleteMany({ userId: id });
    }

    res.status(200).json({message: "User deleted successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  approveProfileStatus,
  deleteProfileStatus,
  rejectProfileStatus,
};
