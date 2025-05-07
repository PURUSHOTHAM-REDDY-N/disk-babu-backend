import { Router } from "express";
import authController from "../controllers/auth.controller"
import fileController from "../controllers/files.controller"
import usersController from "../controllers/users.controller"
import emailTemplatesController from "../controllers/emailTemplates.controller";
import productsController from "../controllers/products.controller";
import partsController from "../controllers/parts.controller";
import customizationOptionsController from "../controllers/customizationOptions.controller";
import customizationsController from "../controllers/customizations.controller";
import categoriesController from "../controllers/categories.controller";
import feedbackController from "../controllers/feedback.controller";

const api = Router()
    .use(authController)
    .use(fileController)
    .use(usersController)
    .use(emailTemplatesController)
    .use(productsController)
    .use(partsController)
    .use(customizationsController)
    .use(customizationOptionsController)
    .use(categoriesController)
    .use(feedbackController)
export default api
