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

    validatePassword = async(enteredPassword: string, savedPassword: string) => {
        return await bcrypt.compare(enteredPassword, savedPassword);
    }

    generateSignature = async (payload: any) => {
        
        const accessToken = jwt.sign(
            payload,
            String(process.env.ACCESS_SECRET),
            {
                expiresIn: '1d'
            }
        )

        const refreshToken = jwt.sign(
            payload,
            String(process.env.REFRESH_SECRET),
            {
                expiresIn:'30d'
            }
        )

        return Promise.resolve({accessToken, refreshToken});

    }

}

