import Joi from 'joi'

export const UserValidation = (body: any) => {
    const schema = Joi.object({
        fullname: Joi.string().required(),
        address: Joi.string().required(),
        phone: Joi.string().required()
        .pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/),
        // .min(10) 
        // .max(10),
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().alphanum().required().label("Password"),
    });
    return schema.validate(body);
}

export const UserLoginValidation = (body: any) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(body);
}