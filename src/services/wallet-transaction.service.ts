import { WalletTransaction } from "@prisma/client";
import * as walletTransactionProvider from "../providers/wallet-transaction.provider";
import * as walletProvider from "../providers/wallet.provider";
import { getAccountDetailsByAccountId } from "./users.service";

export const createWalletTransaction = async (
  userId: string,
  note?: string
): Promise<WalletTransaction | Error> => {
  const user = await getAccountDetailsByAccountId(userId);
  const userWallet = await walletProvider.getWalletByUserId(userId);

  if (user?.billingDetails === null || user?.billingDetails === undefined) {
    throw new Error("Billing details are required ");
  }

  const amount = userWallet?.available ?? 0;
  if (amount < 10) {
    throw new Error("Insufficient balance to withdraw.");
  }
  await walletProvider.moveAvailableToPending(userId, amount);

  return await walletTransactionProvider.createWalletTransaction(
    userId,
    amount,
    user?.billingDetails,
    note
  );
};

export const getWalletTransactionsByUser = async (
  userId: string
): Promise<WalletTransaction[]> => {
  return await walletTransactionProvider.getWalletTransactionsByUser(userId);
};
