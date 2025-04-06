
const jwt = require('jsonwebtoken')
const { adminDetailsModel } = require('../models/adminSchema')


const adminUser = async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        res.status(401).json({ error: "Auth token is required" })
    }

    const token = authorization.split(" ")[1]
    if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {

        // checking token entered by user and generated at time of login is same or not 
        const { userName, _id } = jwt.verify(token, process.env.JWT_TOKEN)

        if (!_id || !userName) {
            return res.status(401).json({ error: "Your session has expired. Please log in again." });
        }

        const user = await adminDetailsModel.findOne({ _id, userName });

        if (!user) {
            return res.status(404).json({ error:  "We couldn't find your account. It may have been deleted or the user name doesn't match." });
        }

        // Attach user details to the request object
        req.userDetails = user;

       // console.log('middleware - user:', req.userDetails);
        next()
    }
    catch (error) {
        res.status(401).json({ error: error.message})
    }
}

module.exports = {
    adminUser
}