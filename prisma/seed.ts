import { db } from "../src/utils/db.server";

type User = {
    name: string;
    email: string;
    password: string
};

const getUsers = (): Array<User> => {
    return [
        {
            name: "Sandeep",
            email: "test@mail.com",
            password: "nepal123"
        },
    ];
}

const seed = async () => {
    await Promise.all(
        getUsers().map((newUser) => {
            const {name, email, password} = newUser;
                return db.user.create({
                    data: {
                        name,
                        email,
                        password
                    }
                })
        })
    )
}

seed();





