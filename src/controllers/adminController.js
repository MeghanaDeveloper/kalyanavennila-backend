
const { adminDetailsModel } = require("../models/adminSchema");
const bcrypt = require('bcrypt');
const { adminToken } = require("../utilities/token");


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

        const token = adminToken({ _id: user._id, userName: user.userName});

         res.status(200).json({
            message: "Successfully Logged In",
            user,
            token
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    adminLoginDetails
}