import { db } from "../src/utils/db.server";
import { Utils } from "../src/utils";

const utils: Utils = new Utils();

type User = {
    uniqueIdentity: string;
    fullname: string;
    email: string;
    password: any;
    address: string;
    phone: string;
};

const getUsers = (): Array <User> => {

    return [
        {
            uniqueIdentity: "a01",
            fullname: "Sandeep",
            address: 'random address',
            phone: "8589685895",
            email: "test@mail.com",
            password: 'nepal123',
        },
    ];
}

const seed = async () => {
    await Promise.all(
        getUsers().map((newUser) => {
            const {uniqueIdentity, fullname, email, password, phone, address} = newUser;
                return db.user.create({
                    data: {
                        uniqueIdentity,
                        fullname,
                        email,
                        phone,
                        password,
                        address,
                    }
                })
        })
    )
}


seed();





