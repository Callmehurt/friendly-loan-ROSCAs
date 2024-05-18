import { db } from "../utils/db.server";
import { User } from "../utils/types";

export class UserService {

    // async listUsers(): Promise <User []> {
    //     return db.user.findMany();
    // }

    listUsers = async(): Promise <User []> => {
        return db.user.findMany();
    }
}

