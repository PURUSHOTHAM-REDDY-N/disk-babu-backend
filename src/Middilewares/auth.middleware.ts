import {Request, NextFunction, Response} from "express";
import {UserRole} from "@prisma/client";
import * as usersService from "../services/users.service"


const jwt = require("jsonwebtoken");

const isValidToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            Object.assign(req.body, {user: decoded});
            return true;
            // await isAtLeastUser(req, res, next);
        } catch (error) {
            // Token verification failed, send a 401 Unauthorized response
            res.status(401).json({message: "Invalid token"});
            return false;
        }
    } else {
        res.status(403).json({message: "Unauthorized"});
        return false;
    }
}

export const isAtLeastUser = async (req: Request, res: Response, next: NextFunction) => {
    const authenticated = await isValidToken(req, res, next);
    if(!authenticated){
        return res;
    }
    const user = await usersService.getAccountDetailsByAccountId(req.body.user.id);
    if(!user){
        return res.status(401).send({message: "Provided token for a user that does not exist"})
    }
    if(user.role !== UserRole.ADMIN && user.role !== UserRole.USER) {
        return res.status(403).send({message: 'User is not authorized to perform the current action'});
    }

    next();
}

export const isAtLeastAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authenticated = await isValidToken(req, res, next);
    if(!authenticated){
        return res;
    }
    const user = await usersService.getAccountDetailsByAccountId(req.body.user.id);
    if (!user) {
        return res.status(401).send({message: 'Provided token for a user that does not exist.'})
    }
    if (user.role !== UserRole.ADMIN) {
        return res.status(403).send({message: 'User is not authorized to perform the current action'})
    }

    next();
}

