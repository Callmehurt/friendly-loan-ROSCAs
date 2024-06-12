export enum userRoles {
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
}

export enum ErrorCodes{
    SERVER_ERROR = 300,
    VALIDATION_ERROR = 600,
    USER_EXIST = 700,
    USER_NOT_FOUND = 701,
    INVALID_CREDENTIAL = 702,
    UNAUTHORIZED = 401,
    INVALID_TOKEN = 403,
    CONFLICT = 409,
    RECORD_NOT_FOUND = 703 
}

export enum LoanStatus {
    PENDING = "pending",
    REJECTED = "rejected",
    ACTIVE = "active",
    COMPLETED = "completed"
}

export enum LoanGuarantorStatus {
    REQUESTED = "requested",
    APPROVED = "approved",
    REJECTED = "rejected"
  }
  
