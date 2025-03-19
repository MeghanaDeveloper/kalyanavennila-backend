
const jwt = require("jsonwebtoken")

const createToken = ({_id,email,mobile}) => {
    return jwt.sign({_id, email,mobile}, process.env.JWT_TOKEN ,{
        expiresIn:"1d"
    })
}

module.exports = createToken;