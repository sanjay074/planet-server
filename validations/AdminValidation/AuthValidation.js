const Joi = require("joi")

//registerScehma

const registrationSchema =Joi.object({

    email:Joi.string().email().required().message({
        'string.email':'Please include a vlaid mail',
        'any.required':'Email is required'
    }),
    password:Joi.string().min(6).required().message({
        'string.min':'Please include a valid password',
        'any.required':'password is required'
    }),
    isAdmin: Joi.boolean().optional()
})

//LoginScehma

const loginSchema =Joi.object({
    email:Joi.string().email().required().message({
        'string.email':'Please include a vlaid mail',
        'any.required':'Email is required'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
})

module.exports = {
    registrationSchema,
    loginSchema
}

