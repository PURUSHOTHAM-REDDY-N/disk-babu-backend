import * as otpRequestsProvider from "../providers/otpRequests.provider";
import {OtpRequest} from "@prisma/client";

export const generateOTP = (length: number = 6): string => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString(); // Generates a random digit (0-9)
    }
    return otp;
};

export const createOtpRequestForUserRegistration = async (email: string): Promise<OtpRequest> => {

    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    let existingOtpRequest = await getRegistrationOtpRequestByEmail(email);
    if(existingOtpRequest){
        existingOtpRequest.otpCode = otpCode;
        existingOtpRequest.otpExpiresAt = otpExpiresAt;
        existingOtpRequest = await otpRequestsProvider.updateOtpRequest(existingOtpRequest.id, existingOtpRequest);

        return existingOtpRequest;
    } else {
        try {
            const otpRequest = await otpRequestsProvider.createRegistrationOtp(email, otpCode, otpExpiresAt);

            return otpRequest;
        } catch (error) {
            console.error('Error creating OTP request:', error);
            throw new Error('Failed to create OTP request');
        }
    }
};

export const getRegistrationOtpRequestByEmail = async (email: string) : Promise<OtpRequest | null> => {
    return await otpRequestsProvider.getRegistrationOtpRequestByEmail(email);
}

export const verifyUserRegistrationOtp = async (email: string, otp: string) => {

    const otpRequest = await getRegistrationOtpRequestByEmail(email);
    if (!otpRequest) {
        throw Error(`Could not find an existing otp for email ${email}`);
    }

    // TODO: Add a dateTime package and check otpExpiration
    if(otpRequest.otpCode !== otp){

       throw Error("Invalid Otp")
    }

    await otpRequestsProvider.deleteOtpRequest(otpRequest.id);
}
