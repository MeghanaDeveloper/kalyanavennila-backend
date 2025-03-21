const Joi = require("joi");

const userValidation = Joi.object({
    email: Joi.string()
        .email() 
        .required()
        .messages({
            "string.email": "Invalid email format! Example: user@example.com",
        }),

        mobile: Joi.string()
        .pattern(/^\+([1-9]{1,3})\d{7,15}$/) 
        .required()
        .messages({
            "string.pattern.base": "Mobile number must be in international format, starting with a '+' and followed by the country code and mobile number."
        })
})
.unknown(true);


const passwordValidation = Joi.object({
    password: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[0-9])(?=.*[@#$]).{8,}$"))
        .optional()
        .messages({
            "string.min": "Password must be at least 8 characters long and include at least 1 number and 1 special character (@, #, $)."
        }),
        newPassword: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[0-9])(?=.*[@#$]).{8,}$"))
        .optional()
        .messages({
            "string.min": "Password must be at least 8 characters long and include at least 1 number and 1 special character (@, #, $)."
        }),

    confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            "any.only": "Passwords do not match!"
        })
}).unknown(true);

module.exports = { userValidation , passwordValidation};
