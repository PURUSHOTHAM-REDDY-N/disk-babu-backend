import {NextFunction, Request, Response, Router} from "express";
import * as authService from "../services/auth.service";
import * as jwtServices from "../utils/token.utils"

const router = Router();

router.post("/auth/verify", async (req: Request, res: Response, next: NextFunction) => {
    let user = jwtServices.verifyToken(req.body.token)
    if (!user) {
        return res.status(401).send({message: "Unauthorized or invalid token"})
    }
    return res.json({user});
})

router.post("/auth/login",async (req:Request,res:Response,next:NextFunction) => {
    try {
        const user = await authService.login(req.body)
        if(!user) {
            return res.status(404).send(`User with email ${req.body.email} does not exist`);
        }

        return res.status(200).json({...user})
    } catch (error: any) {

        return res.status(400).send({message: `${error.message}`})
    }
})



export default router
