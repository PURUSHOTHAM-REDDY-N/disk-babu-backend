import { NextFunction, Request, Response, Router } from "express";
import { isValidToken } from "../Middilewares/auth.middleware";
import * as walletsTransactionService from "../services/wallet-transaction.service";

const router = Router();

router.post(
  "/wallet-transaction/create",
  isValidToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.user.id;

    try {
      const walletTransaction =
        await walletsTransactionService.createWalletTransaction(
          userId,
        );
      return res.status(200).send(walletTransaction);
    } catch (e: any) {
      return res.status(400).send({ message: `${e.message}` });
    }
  }
);

router.get(
  "/wallet-transaction/user", isValidToken,
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const transactions =
        await walletsTransactionService.getWalletTransactionsByUser(req.body.user.id);
      return res.status(200).send(transactions);
    } catch (e: any) {
      return res.status(400).send({ message: `${e.message}` });
    }
  })



export default router;
