import { db } from "../utils/db.server";
import { User } from "../utils/types";
import { Utils } from "../utils";


const utils: Utils = new Utils();


export class UserService {

    findUser = async(email: string): Promise <User | null> => {
        return db.user.findUnique({
            where: {
                email: email
            }
        })
    }

    createStudent = async (data: Omit<User, "id">): Promise <Partial<User | null>> => {

        const { fullname, address, email, password, phone} = data;

        //hashed password
        const hashedPassword = await utils.generateHashPassword(password);


        return db.user.create({
            data: {
                fullname,
                address,
                email,
                password: hashedPassword,
                phone
            },
            select: {
                id: true,
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

    listUsers = async(): Promise <User []> => {
        return db.user.findMany();
    }
}

