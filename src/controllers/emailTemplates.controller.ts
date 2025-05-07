import {json, NextFunction, Request, Response, Router} from "express";
import * as emailTemplatesService from "../services/emailTemplates.service"
import * as authOptions from "../Middilewares/auth.middleware";
import {EmailTemplate} from "@prisma/client";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailTemplate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - template
 *         - subjectTemplate
 *       properties:
 *         id:
 *           type: string
 *           example: "template123"
 *           description: Unique identifier for the email template
 *         name:
 *           type: string
 *           example: "Welcome Email"
 *           description: The name of the email template
 *         description:
 *           type: string
 *           example: "This template is used for the welcome email."
 *           description: A brief description of what the template is used for
 *         template:
 *           type: string
 *           example: "<h1>Welcome!</h1><p>Thanks for joining us. your {{otp}}</p>"
 *           description: The HTML content for the email template
 *         subjectTemplate:
 *           type: string
 *           example: "Welcome to Our Service"
 *           description: The subject of the email
 *   responses:
 *     EmailTemplateResponse:
 *       type: object
 *       properties:
 *         emailTemplate:
 *           $ref: '#/components/schemas/EmailTemplate'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Email template creation failed"
 * 
 * /emailTemplates/create:
 *   post:
 *     summary: Create a new email template
 *     tags: [EmailTemplates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailTemplate'
 *     responses:
 *       200:
 *         description: Email template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailTemplateResponse'
 *       400:
 *         description: Bad request, invalid input or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


router.post("/emailTemplates/create",
    
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        console.log(`Request-Body: ${json(body)}. Type is ${typeof body}`)
        const requestTemplate = {
            id: body.id,
            name: body.name,
            description: body.description,
            template: body.template,
            subjectTemplate: body.subjectTemplate
        } as EmailTemplate

        try {
            const emailTemplate = await emailTemplatesService.createEmailTemplate(requestTemplate)
            res.json({emailTemplate})
        } catch (error: any) {
            console.log(error);
           res.status(400).send({message: `${error.message}`})
        }
    }
)


export default router;
