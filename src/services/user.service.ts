import { db } from "../utils/db.server";
import { EmailToken, User } from "../utils/types";
import { Utils } from "../utils";

const utils: Utils = new Utils();

export class UserService {

    //store user email validation token
    storeEmailValidationToken = async (userId: number, token: string): Promise <EmailToken | null> => {
        return await db.$transaction( async (tx) => {
            return await tx.emailToken.create({
                data: {
                    userId: userId,
                    token: token
                }
            })
        })
    }

    findAdmin = async(): Promise <Partial <User | null>> => {
        return await db.user.findFirst({
            where: {
                role: "admin"
            }
        })
    }

    findUser = async(email: string): Promise <Partial <User | null>> => {
        return db.user.findUnique({
            where: {
                email: email
            }
        })
    }

    findUserById = async(id: number): Promise <User | null> => {
        return await db.user.findFirst({
            where: {
                id: id
            }
        })
    }

    findUserByUniqueIdentity = async(uniqueIdentity: string): Promise <Partial<User | null>> => {
        return await db.user.findFirst({
            where: {
                uniqueIdentity: uniqueIdentity
            },
            select: {
                id: true,
                uniqueIdentity: true,
                fullname: true,
                address: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    findUserByToken = async(token: string): Promise <Partial<User | null>> => {
        return db.user.findFirst({
            where: {
                refreshToken: token
            },
            select: {
                id: true,
                uniqueIdentity: true,
                profile: true,
                publicId: true,
                fullname: true,
                address: true,
                email: true,
                phone: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    createStudent = async (data: Omit<User, "id">): Promise <Partial<User | null>> => {

        const { fullname, address, email, password, phone, profile, publicId} = data;

        //hashed password
        const hashedPassword = await utils.generateHashPassword(password);
        const uniqueIdentity = await utils.generateRandomId(10);

        return await db.$transaction( async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    uniqueIdentity,
                    fullname,
                    address,
                    email,
                    password: hashedPassword,
                    phone,
                    profile,
                    publicId
                },
                select: {
                    id: true,
                    uniqueIdentity: true,
                    fullname: true,
                    address: true,
                    email: true,
                    phone: true,
                    role: true,
                    profile: true,
                    createdAt: true,
                    updatedAt: true
                }
            })

            return newUser;
        })
    }

    updateUser = async(id: number, data: any): Promise <User | null> => {
        return await db.$transaction( async (tx) => {
            return await tx.user.update({
                where: {
                    id: id
                },
                data: data
            });
        })
    }

    listUsers = async(): Promise <User []> => {
        return db.user.findMany();
    }


    //non admin users
    listNonAdminUsers = async(): Promise<User[]> => {
        return await db.user.findMany({
            where: {
                role: {
                    not: "admin"
                }
            }
        });
    }


    //search for member or user
    searchUserByNameOrUniqueIdentity = async (searchParams: string): Promise <User []> => {
        return await db.user.findMany({
            where:{
                OR: [
                    {
                        fullname: {
                            contains: searchParams.toLocaleLowerCase()
                        }
                    },
                    {
                        uniqueIdentity: searchParams
                    }
                ].filter(Boolean)
            }
        })
    }

    // password change
    changePassword = async (userId: number, newPassword: string): Promise <User | null> => {

        //hashed password
        const hashedPassword = await utils.generateHashPassword(newPassword);

        return await db.$transaction( async (tx) => {
            return await tx.user.update({
                where: {
                    id: userId
                },
                data: {
                    password: hashedPassword
                }
            })
        })

    }

    
}

