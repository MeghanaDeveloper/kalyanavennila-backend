

const jwt = require('jsonwebtoken')
const { userDetailsModel } = require('../models/userHooks')


const authUser = async (req, res, next) => {
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
        const { _id, email, mobile } = jwt.verify(token, process.env.JWT_TOKEN)

        if (!_id || !email || !mobile) {
            return res.status(401).json({ error: "Your session has expired. Please log in again." });
        }

        const user = await userDetailsModel.findOne({ _id, email });

        if (!user) {
            return res.status(404).json({ error:  "We couldn't find your account. It may have been deleted or the email doesn't match. Please try again." });
        }

        // Optional checks for email and mobile in addition to ID
        if (user.email !== email || user.mobile !== mobile) {
            return res.status(401).json({ error: "Your login details don't match our records. Please try again." });
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
    authUser
}