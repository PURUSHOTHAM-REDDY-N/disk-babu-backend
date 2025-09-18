import { Wallet } from "@prisma/client";
import * as walletProvider from "../providers/wallet.provider";


export const createWallet = async (userId:string): Promise<Wallet> => {
  return await walletProvider.createWallet(userId);
};

export const getWalletByUserId = async (userId: string): Promise<Wallet | null> => {
  return await walletProvider.getWalletByUserId(userId);
}