import { Decimal } from "@prisma/client/runtime/library";
import { LoanGuarantorStatus, LoanStatus } from "./enums";

export interface User{
    id: number;
    profile: string | null;
    publicId: string | null;
    uniqueIdentity: string;
    fullname: string;
    address: string,
    email: string;
    phone: string;
    password: string;
    role: string;
}

export interface UserWithGroup{
    id: number;
    profile: string | null;
    publicId: string | null;
    uniqueIdentity: string;
    fullname: string;
    address: string,
    email: string;
    phone: string;
    password: string;
    role: string;
    groups: GroupMember;
}


export interface SavingGroup{
    id: string;
    thumbnail: string | null;
    publicId: string | null;
    name: string;
    description: string;
    userId: number;
}

export interface GroupMember{
    userId: number,
    groupId: string,
    addedBy: number
}

export interface CreateGroupAndEnrollSelfResult{
    newGroup: SavingGroup;
    newMember: GroupMember;
};


export interface Contribution{
    id: number;
    userId: number;
    groupId: string;
    amount: Decimal;
    contributionDate: Date;
    paymentId: string;
}

export interface Loan {
    id: number;
    reference: string;
    userId: number;
    groupId: string;
    principalAmount: Decimal;
    interestRate: Decimal;
    loanStartDate: Date;
    loanEndDate: Date;
    status: LoanStatus; 
}

export interface LoanData {
    userId: number;
    groupId: string;
    principalAmount: Decimal;
    interestRate: any;
    loanStartDate?: Date;
    loanEndDate?: Date;
    status?: LoanStatus; 
    guarantorIds?: number[]
}

export interface LoanGuarantors {
    id: number;
    loanId: number;
    guarantorId: number;
    status: LoanGuarantorStatus;
}

export interface Image {
    url: string;
    public_id: string;
  }