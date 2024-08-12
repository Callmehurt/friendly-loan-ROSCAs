import Joi from 'joi'

export const UserValidation = (body: any) => {
    const schema = Joi.object({
        profile: Joi.string(),
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
        thumbnail: Joi.object({
            name: Joi.string().required(),
            size: Joi.number().positive().required(),
            type: Joi.string().required(),
          }),
        name: Joi.string().min(5).required(),
        description: Joi.string().required()
    });

    return schema.validate(body);
}

export const ContributionValidation = (body: {groupId: string, amount: number, paymentId: string}) => {
    const schema = Joi.object({
        groupId: Joi.string().required().label('Group ID'),
        paymentId: Joi.string().required().label('Payment ID'),
        amount: Joi.number().precision(2).required()
    })

    return schema.validate(body);
}

export const LoanRequestValidation = (body: {groupId: string, principalAmount: number, guarantorIds: number[]}) => {
    const schema = Joi.object({
        groupId: Joi.string().required().label('Group ID'),
        principalAmount: Joi.number().required().label('Principal Amount'),
        guarantorIds: Joi.array().label('Guarantors')
    });

    return schema.validate(body);
}