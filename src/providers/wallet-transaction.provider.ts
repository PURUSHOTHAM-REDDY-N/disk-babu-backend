import { TransactionStatus, TransactionType } from '@prisma/client';
import prisma from '../../prisma/prisma-client';
import { InputJsonValue } from '@prisma/client/runtime/library';

export const createWalletTransaction = async (
  userId: string,
  amount: number,
  billingDetails:any,
  note?: string,
) => {
  return await prisma.walletTransaction.create({
    data: {
      userId,
      amount,
      billingDetails,
      note,
    },
  });
};

export const getWalletTransactionsByUser = async (userId: string) => {
  return await prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getWalletTransactionById = async (id: string) => {
  return await prisma.walletTransaction.findUnique({
    where: { id },
  });
};

export const updateWalletTransactionStatus = async (
  id: string,
  status: TransactionStatus,
) => {
  return await prisma.walletTransaction.update({
    where: { id },
    data: { status },
  });
};

// Update a transaction's note or referenceId (or both)
export const updateWalletTransactionDetails = async (
  id: string,
  updates: {
    note?: string;
    referenceId?: string;
  }
) => {
  return await prisma.walletTransaction.update({
    where: { id },
    data: updates,
  });
};
