import { Router } from "express";
import authController from "../controllers/auth.controller";
import emailTemplatesController from "../controllers/emailTemplates.controller";
import analyticsController from "../controllers/file-analytics.controller";
import fileController from "../controllers/files.controller";
import usersController from "../controllers/users.controller";

const api = Router()
  .use(authController)
  .use(fileController)
  .use(usersController)
  .use(emailTemplatesController)
  .use(analyticsController);

export default api;
