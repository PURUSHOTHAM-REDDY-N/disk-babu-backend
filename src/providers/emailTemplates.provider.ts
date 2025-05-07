import {EmailTemplate} from "@prisma/client";
import prisma from "../../prisma/prisma-client";

export const createEmailTemplate = async (request: EmailTemplate): Promise<EmailTemplate> => {
    const emailTemplate = await prisma.emailTemplate.create({
        data: request
    })

    return emailTemplate;
}

export const getById = async (id: string) : Promise<EmailTemplate> => {
    const emailTemplate = await prisma.emailTemplate.findUniqueOrThrow({
        where: {
            id: id
        }
    })

    return emailTemplate;
}
