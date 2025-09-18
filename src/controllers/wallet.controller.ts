import {NextFunction, Request, Response, Router} from "express";
import { isValidToken } from "../Middilewares/auth.middleware";
import * as walletsService from "../services/wallet.service";
const router = Router();

router.post("/adminkowfm/wallet/create",isValidToken,
    async (req: Request, res: Response, next: NextFunction) => {

        try {
          const wallet =  await walletsService.createWallet(req.body.user.id);
          return res.status(200).send(wallet);
        } catch (e: any) {

            return res.status(400).send({message:`${e.message}`})
        }
    
    }
)

router.get("/wallet/get", isValidToken,
    async (req: Request, res: Response, next: NextFunction) => {    

        try {
            const wallet = await walletsService.getWalletByUserId(req.body.user.id);
            if (!wallet) {
                return res.status(404).send({message: "Wallet not found"});
            }
            const total = wallet.available + wallet.approved + wallet.paid +wallet.pending;
            Object.assign(wallet, {total: total});
            return res.status(200).send(wallet);
        } catch (e: any) {
            return res.status(400).send({message: `${e.message}`});
        }
    }
)



export default router;
