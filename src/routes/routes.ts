import { Router } from "express";
import authController from "../controllers/auth.controller";
import emailTemplatesController from "../controllers/emailTemplates.controller";
import analyticsController from "../controllers/file-analytics.controller";
import fileController from "../controllers/files.controller";
import usersController from "../controllers/users.controller";
import walletController from "../controllers/wallet.controller";
import walletTransactionController from "../controllers/wallet-transaction.controller";
import storageController from "../controllers/storage.controller";
const api = Router()
  .use(authController)
  .use(fileController)
  .use(usersController)
  .use(emailTemplatesController)
  .use(analyticsController)
  .use(walletController)
  .use(walletTransactionController)
  .use(storageController);

export default api;
