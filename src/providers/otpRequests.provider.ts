import prisma from "../../prisma/prisma-client";
import {OtpRequest, OtpType} from "@prisma/client";

export const createRegistrationOtp = async (email: string, otpCode: string, otpExpiresAt: Date) : Promise<OtpRequest> => {

    const otpRequest = await prisma.otpRequest.create({
        data: {
            email: email,
            otpType: OtpType.USER_EMAIL_REGISTRATION,
            otpCode: otpCode,
            otpExpiresAt: otpExpiresAt
        }
    });

    return otpRequest;
};

export const getRegistrationOtpRequestByEmail = async (email: string) : Promise<OtpRequest | null> => {

    const otpRequest = await prisma.otpRequest.findFirst({
        where: {
            email: email,
            otpType: OtpType.USER_EMAIL_REGISTRATION
        }
    })

    return otpRequest;
}

export const updateOtpRequest = async (id: string, otpRequest: OtpRequest) : Promise<OtpRequest> => {
    otpRequest = await prisma.otpRequest.update({
        where: {id: id},
        data: {
            email: otpRequest.email,
            otpCode: otpRequest.otpCode,
            otpExpiresAt: otpRequest.otpExpiresAt,
            otpType: otpRequest.otpType,
            updatedAt: new Date
        }
    })

    return otpRequest;
}

export const deleteOtpRequest = async (id: string) => {
    const otpRequest = await prisma.otpRequest.delete({
        where: {id: id}
    })

    return otpRequest;
}
