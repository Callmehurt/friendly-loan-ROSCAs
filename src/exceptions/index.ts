import { string } from "joi";
import { ErrorCodes } from "../utils/enums";

export class AppError extends Error{
    message: string;
    errorCode: ErrorCodes;
    error: any;
    description: string | null;

    constructor(
        message: string, 
        errorCode: any, 
        error: any,
        description: string
    ){
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.error = error;
        this.description = description;
    }
}

export class ApiError extends AppError{

    constructor(
        message: string,
        errorCode: ErrorCodes = ErrorCodes.VALIDATION_ERROR,
        description: string,
        error: any
    ){
        super(
            message,
            errorCode,
            error,
            description
        )
    }
}

export class ValidationError extends AppError{

    constructor(
        message: string,
        error: any
    ){
        super(
            message,
            ErrorCodes.VALIDATION_ERROR,
            error,
            'Validation Error'
        )
    }
}

export class UserExistError extends AppError{

    constructor(
        message: string = 'User with this email is already been registered!',
        errorCode: ErrorCodes = ErrorCodes.USER_EXIST,
        description: string = 'User Exist Error',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}


