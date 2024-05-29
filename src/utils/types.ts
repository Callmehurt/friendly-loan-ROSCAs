import { Decimal } from "@prisma/client/runtime/library";

export interface User{
    id: number;
    uniqueIdentity: string;
    fullname: string;
    address: string,
    email: string;
    phone: string;
    password: string;
    role: string;
}


export interface SavingGroup{
    id: string;
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
}