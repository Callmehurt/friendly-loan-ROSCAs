import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class Utils {

    generateSalt = async () => {
        return await bcrypt.genSalt(Number(process.env.SALT));
    }

    generateHashPassword = async (password: string) => {
        const salt = await this.generateSalt();
        return await bcrypt.hash(password, salt);
    }


}

