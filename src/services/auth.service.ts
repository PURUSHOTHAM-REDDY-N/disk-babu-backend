import {LoginInput} from "../models/auth.model";
import bcrypt from "bcrypt";
import generateToken from "../utils/token.utils";
import * as usersProvider from "../providers/users.provider"


export const login = async (input: LoginInput) => {
  const email = input.email.trim();
  const password = input.password.trim();

  const user = await usersProvider.getByEmail(email)
  if (!user) {
    return null;
  }
  let response: Omit<any, 'password'> = user;

  const match = await bcrypt.compare(password, user.password);
  let safeUser = JSON.parse(JSON.stringify(user), function (key, value) {
    if (key === "password") {
      return undefined;
    }

    return value;
  });

  if (!match) {
    throw new Error('Password does not match');
  }
  response = {...safeUser, token: generateToken({id: user.id})}

  return response;
};

