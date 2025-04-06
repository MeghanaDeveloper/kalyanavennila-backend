
    const jwt = require("jsonwebtoken")

    const createToken = ({_id,email,mobile}) => {
        return jwt.sign({_id, email,mobile}, process.env.JWT_TOKEN ,{
            expiresIn:"1d"
        })
    }

    const adminToken = ({_id, userName}) => {
        return jwt.sign({_id, userName}, process.env.JWT_TOKEN ,{
            expiresIn:"1d"
        })
    }

    module.exports = {
        createToken,
        adminToken
    };