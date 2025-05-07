import * as usersProvider from "../providers/users.provider";
import {User} from "@prisma/client";
import {RegisterInput} from "../models/auth.model";


export const createUser = async (input: RegisterInput) => {
    return await usersProvider.createUser(input);
};

export const getAccountDetailsByAccountId = async (id: string): Promise<User | null> => {
    return await usersProvider.getById(id);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
     return await usersProvider.getByEmail(email);
}

export const editUser = async (user: User, input: User) => {

    if(input.dob!){
        user.dob = input.dob;
    }
    if(input.country!){
        user.country = input.country;
    }
    if(input.image){
        user.image = input.image;
    }
    if(input.firstName!){
        user.firstName = input.firstName
    }
    if(input.lastName!){
        user.lastName = input.lastName
    }
    if(input.middleName!){
        user.middleName = input.lastName
    }

    user = await usersProvider.updateUser(user.id, user);

    return user;
};
