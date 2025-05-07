import {EmailTemplate, OtpRequest} from "@prisma/client";
import * as emailTemplatesProvider from "../providers/emailTemplates.provider"
import * as emailTemplateConstants from "../constants/emailTemplatesConstants"
import * as emailSenderService from "../services/emailSender.service"

export const createEmailTemplate = async (request: EmailTemplate) => {
    return await emailTemplatesProvider.createEmailTemplate(request);
}

export const getById = async (id: string) : Promise<EmailTemplate | null> => {
        return await emailTemplatesProvider.getById(id);
}

export const sendUserRegistrationOtpEmail = async (otpRequest: OtpRequest) => {
    const emailTemplate = await getById(emailTemplateConstants.SendUserRegistrationOtpEmail)
    if(!emailTemplate){
        throw Error("Internal exception: Could not find email template for user registration")
    }
    const records = toRecord(otpRequest);
    const subject = replaceTemplateVariables(emailTemplate.subjectTemplate, records);
    const body = replaceTemplateVariables(emailTemplate.template, records);

    try {
        await emailSenderService.sendEmail([otpRequest.email!], subject, body)
    } catch (e: any) {
        throw Error(`Internal Exception: Error occurred while sending email to user. ${e.message}`)
    }
}

const replaceTemplateVariables = (template: string, data: Record<string, string>): string => {
    return Object.entries(data).reduce((result, [key, value]) => {
        // Use a regex to replace placeholders like {{key}} with actual values
        const regex = new RegExp(`{{${key}}}`, 'g');
        return result.replace(regex, value);
    }, template);
};

const toRecord = (obj: Record<string, any>): Record<string, string> => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, String(value)])
    );
};

