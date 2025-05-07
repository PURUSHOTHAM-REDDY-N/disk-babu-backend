import {NextFunction, Request, Response, Router} from "express";
import * as usersService from "../services/users.service"
import * as authOptions from "../Middilewares/auth.middleware";
import * as usersProvider from "../providers/users.provider"
import * as emailSenderService from "../services/emailSender.service"
import * as otpRequestsService from "../services/otpRequests.service"
import * as emailTemplatesService from "../services/emailTemplates.service"
import generateToken from "../utils/token.utils";

const router = Router();
/**
 *
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "66f5accb70357ebe5cdc3a41"
 *         email:
 *           type: string
 *           example: "test@gmail.com"
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         middleName:
 *           type: string
 *           example: "Albert"
 *         dob:
 *           type: string
 *           format: date-time
 *         country:
 *           type: string
 *           example: "India"
 *         image:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: "https://path.to.image/1.jpeg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         role:
 *           type: string
 *           enum: ["USER", "ADMIN"]
 *           example: "USER"
 *
 *
 * /users/verify-and-register:
 *   post:
 *     summary: Verify OTP and register user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: test123
 *               firstName:
 *                 type: string
 *                 example: test
 *               lastName:
 *                 type: string
 *                 example: test
 *               otp:
 *                 type: string
 *                 example: 728672
 */

/**
 * @swagger
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid Otp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

 router.post("/users/verify-and-register",
    async (req: Request, res: Response, next: NextFunction) => {

        const email = req.body.email;
        const otp = req.body.otp;

        try {
           await otpRequestsService.verifyUserRegistrationOtp(email, otp)
        } catch (e: any) {

            return res.status(400).send({message:`${e.message}`})
        }
        try {
            const user = await usersService.createUser(req.body)

            return res.json({...user, token: generateToken({ id: user.id })})
        } catch (e: any) {

            return res.status(500).send({message: `Internal Exception: Error occurred while creating user. ${e.message}`})
        }
    }
)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve user details by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *           example: "66f5accb70357ebe5cdc3a41"
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find a user with id 66f5accb70357ebe5cdc3a41"
 */
router.get(`/users/:id`,
    async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;
        const user = await usersService.getAccountDetailsByAccountId(id)
        if (!user) {

            return res.status(400).send({message: `Could not find a user with id ${id}`})
        }
        return res.json(user)
    }
)

/**
 * @swagger
 * /users/{id}/edit:
 *   post:
 *     summary: Edit a user's details
 *     description: Update a user's information such as date of birth, country, name, and profile image.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields to update in the user profile
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dob:
 *                 type: string
 *                 format: date-time
 *                 description: User's date of birth
 *               country:
 *                 type: string
 *                 description: User's country
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: User's profile image
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               middleName:
 *                 type: string
 *                 description: User's middle name
 *     responses:
 *       200:
 *         description: User successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The updated user object
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post('/users/:id/edit',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;

        try {
            let user = await usersProvider.getById(id);
            if (!user) {

                return res.status(404).send(`User with id ${id} not found`)
            }
            user = await usersService.editUser(user, req.body)

            return res.json({user})
        } catch (error: any) {

            return res.status(500).send(`Internal Exception: ${error.message}`)
        }
    }
)

router.post('/users/test-email',
    async (req: Request, res: Response, next: NextFunction) => {

        const body = req.body;
        try {
            await emailSenderService.sendEmail(body.emails, body.subject, body.html);
        } catch (e: any) {
            console.log(`Error while sending email: ${e.message}`);

            return res.send(500).send({message: "Internal error occurred while sending email"})
        }

        return res.status(200).send({message: "Email sent successfully"})
    }
)

/**
 * @swagger
 * /users/send-registration-otp:
 *   post:
 *     summary: Send OTP for User Registration
 *     description: Sends a registration OTP to the user via email if the email is not already associated with an account.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@example.com"
 *                 description: The email address to which the registration OTP will be sent.
 *     responses:
 *       200:
 *         description: Success response when the OTP is sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully"
 *                   description: The response message indicating that the OTP email was successfully sent.
 *       400:
 *         description: Error when the email already exists in the system.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An account with email test@example.com already exists"
 *                   description: The response message indicating that an account with the provided email already exists.
 *       500:
 *         description: Internal server error if something goes wrong while sending the email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                   description: The error message when an unexpected error occurs.
 */
router.post('/users/send-registration-otp',
    async (req: Request, res: Response, next: NextFunction) => {

        let email = req.body.email;

        const user = await usersService.getUserByEmail(email);
        if (user) {

            return res.status(400).send({message: `An account with email ${email} already exists`})
        }
        try {
            const otpRequest = await otpRequestsService.createOtpRequestForUserRegistration(email)
            await emailTemplatesService.sendUserRegistrationOtpEmail(otpRequest);
        } catch (e: any) {
            return res.status(500).send({message: e.message})
        }

        return res.status(200).send({message: "Email sent successfully"})
    }
)


export default router;
