import { Router } from "express";
import authController from "../controllers/auth.controller"
import fileController from "../controllers/files.controller"
import usersController from "../controllers/users.controller"
import emailTemplatesController from "../controllers/emailTemplates.controller";

const api = Router()
    .use(authController)
    .use(fileController)
    .use(usersController)
    .use(emailTemplatesController)
export default api
