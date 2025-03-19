

const jwt = require('jsonwebtoken')
const { userDetailsModel } = require('../models/userSchema')


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
            return res.status(401).json({ error: "Invalid token" });
        }

        const user = await userDetailsModel.findById(_id);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Optional checks for email and mobile in addition to ID
        if (user.email !== email || user.mobile !== mobile) {
            return res.status(401).json({ error: "Token and user details does not match" });
        }

        // Attach user details to the request object
        req.userDetails = user;

       // console.log('middleware - user:', req.userDetails);
        next()
    }
    catch (err) {
        res.status(401).json({ error: 'Request is not authorized ! Please Check the token' })
    }
}

module.exports = {
    authUser
}