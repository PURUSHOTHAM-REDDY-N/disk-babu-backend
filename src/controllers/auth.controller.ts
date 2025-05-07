import {NextFunction, Request, Response, Router} from "express";
import * as authService from "../services/auth.service";
import * as jwtServices from "../utils/token.utils"

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserWithToken:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             token:
 *               type: string
 *               description: Authentication token for the user
 *
 *
 */

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify a user token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "66f5accb70357ebe5cdc3a41"
 *                     email:
 *                       type: string
 *                       example: "test@gmail.com"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *       401:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized or invalid token"
 */
router.post("/auth/verify", async (req: Request, res: Response, next: NextFunction) => {
    let user = jwtServices.verifyToken(req.body.token)
    if (!user) {
        return res.status(401).send({message: "Unauthorized or invalid token"})
    }
    return res.json({user});
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWithToken'
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'User not found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 */
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
