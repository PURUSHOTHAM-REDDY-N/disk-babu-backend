import jwt from 'jsonwebtoken';
import {User} from "@prisma/client";

const generateToken = (user: Partial<User>): string =>
  jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_EXPIRATION! });

export const verifyToken = (token: string): User | null => {
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET!) as User;
        return user;
    } catch (err) {
        // Token expired or invalid
        return null;
    }
};

export default generateToken;
