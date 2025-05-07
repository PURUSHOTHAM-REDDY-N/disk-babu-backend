export interface RegisterInput {
    email:string;
    password:string;
    firstName: string;
    lastName: string;
    middleName?: string;
    image?:string;
    dob?: Date,
    otp: string
}

export interface LoginInput {
    email:string;
    password:string;
}
