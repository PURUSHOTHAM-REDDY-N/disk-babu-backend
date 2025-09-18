import {RegisterInput} from "../models/auth.model";
import bcrypt from "bcrypt";
import prisma from "../../prisma/prisma-client";
import {User} from "@prisma/client";
import { createWallet } from "./wallet.provider";

export const createUser = async (input: RegisterInput) => {
    const email = input.email?.trim();
    const password = input.password;
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    const middleName = input.middleName?.trim();
    const dob = input.dob;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = await prisma.user.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            dob: dob,
            email: email,
            password: hashedPassword,
            createdAt: new Date()
        }
    }).then(async (user) => {
        await createWallet(user.id);
        return user;
    });


    

    return user;
};

export const getByEmail = async(email: string) : Promise<User | null>  => {
    const user: User | null = await prisma.user.findUnique({
        where: {
            email: email,
        }
    });

    return user
}

export const getById = async(id: string): Promise<User | null> => {
    const user: User | null = await prisma.user.findUnique({
        where: {
            id: id,
        }
    });

    return user
}

export const updateUser = async (id: string, input: User) : Promise<User> => {
    const user = await prisma.user.update({
        where:{
            id:id
        },
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            middleName: input.middleName,
            dob: input.dob,
            country: input.country,
            image: input.country
        }
    });

    return user;
};

export const updatedUserBillingDetails = async (id: string, billingDetails: any) : Promise<User> => {
    const user = await prisma.user.update({
        where:{
            id:id
        },
        data: {
            billingDetails: billingDetails
        }
    });

    return user;
}


