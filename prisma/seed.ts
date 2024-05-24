import { db } from "../src/utils/db.server";

type User = {
    fullname: string;
    email: string;
    password: string;
    address: string;
    phone: string;
};

const getUsers = (): Array <User> => {
    return [
        {
            fullname: "Sandeep",
            address: 'random address',
            phone: "8589685895",
            email: "test@mail.com",
            password: "nepal123"
        },
    ];
}

const seed = async () => {
    await Promise.all(
        getUsers().map((newUser) => {
            const {fullname, email, password, phone, address} = newUser;
                return db.user.create({
                    data: {
                        fullname,
                        email,
                        phone,
                        password,
                        address
                    }
                })
        })
    )
}

seed();





