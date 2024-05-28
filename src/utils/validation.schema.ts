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

export const UserLoginValidation = (body: {email: string, password: string}) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(body);
}

export const SavingGroupValidation = (body: {name: string, description: string}) => {

    const schema = Joi.object({
        name: Joi.string().min(5).required(),
        description: Joi.string().required()
    });

    return schema.validate(body);
}