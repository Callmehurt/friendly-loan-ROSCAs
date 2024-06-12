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
        errorCode: ErrorCodes = ErrorCodes.SERVER_ERROR,
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

export class UserNotFoundError extends AppError{

    constructor(
        message: string = 'User with this email is not found',
        errorCode: ErrorCodes = ErrorCodes.USER_NOT_FOUND,
        description: string = 'User does not exist error',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}

export class RecordNotFoundException extends AppError{

    constructor(
        message: string,
        errorCode: ErrorCodes = ErrorCodes.RECORD_NOT_FOUND,
        description: string = 'No data',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}

export class InvalidCredentialError extends AppError{

    constructor(
        message: string = 'Provided credential is not valid',
        errorCode: ErrorCodes = ErrorCodes.INVALID_CREDENTIAL,
        description: string = 'Invalid credential',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}

export class UnauthorizedException extends AppError{

    constructor(
        message: string = 'Unauthorized user',
        errorCode: ErrorCodes = ErrorCodes.UNAUTHORIZED,
        description: string = 'Unauthorized',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}

export class InvalidTokenException extends AppError{

    constructor(
        message: string = 'Invalid token provided',
        errorCode: ErrorCodes = ErrorCodes.INVALID_TOKEN,
        description: string = 'Invalid Token',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}

export class ConflictException extends AppError{

    constructor(
        message: string = 'User already in the group',
        errorCode: ErrorCodes = ErrorCodes.CONFLICT,
        description: string = 'Conflict error',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}

export class ContributionConflictException extends AppError{

    constructor(
        message: string = 'User already contributed in the group for the current month',
        errorCode: ErrorCodes = ErrorCodes.CONFLICT,
        description: string = 'Conflict error',
    ){
        super(
            message,
            errorCode,
            '',
            description,
        )
    }
}


