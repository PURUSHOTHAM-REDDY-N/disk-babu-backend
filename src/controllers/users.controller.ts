import {NextFunction, Request, Response, Router} from "express";
import * as usersService from "../services/users.service"
import * as authOptions from "../Middilewares/auth.middleware";
import * as usersProvider from "../providers/users.provider"
import * as emailSenderService from "../services/emailSender.service"
import * as otpRequestsService from "../services/otpRequests.service"
import * as emailTemplatesService from "../services/emailTemplates.service"
import generateToken from "../utils/token.utils";

const router = Router();

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

router.post('/users/update-billing-details',
    authOptions.isValidToken, async (req: Request, res: Response, next: NextFunction) => {
    const billingDetails = req.body.billingDetails;

    try {

        await usersService.updatedUserBillingDetails(req.body.user, billingDetails);
        return res.status(200).send({message: "Billing details updated successfully", billingDetails})
        
    } catch (error: any) {
        return res.status(500).send({message: `Internal Exception: ${error.message}`})
        
    }

})  


export default router;
