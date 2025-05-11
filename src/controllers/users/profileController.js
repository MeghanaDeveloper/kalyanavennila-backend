
const { userDetailsModel} = require('../../models/userHooks')

//update profile
const updateProfileDetails = async (req, res) => {
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

        if (user.isProfileStatus === "Rejected") {
            user.isProfileStatus = "Pending"; 

        }

        await user.save();
        res.status(200).json({ message: "User details updated successfully", user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//users
const getUserByEmail = async (req, res) => {
    const { email } = req.userDetails;
    try {
        const user = await userDetailsModel.findOne({email});
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        res.status(200).json({ message: "Users retrieved successfully", user });
    } catch (error) {
        res.status(400).json({  error: error.message });
    }
};

module.exports = {
    updateProfileDetails,
    getUserByEmail
}