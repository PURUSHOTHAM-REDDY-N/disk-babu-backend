import prisma from "../../prisma/prisma-client";

type UpdateType = "increment" | "decrement";

export const createWallet = async (userId: string) => {
  const wallet = await prisma.wallet.create({
    data: {
      userId: userId,
    },
  });

  return wallet;
};

export const getWalletByUserId = async (userId: string) => {
  return await prisma.wallet.findUnique({
    where: { userId },
  });
};

export const moveAvailableToPending = async (userId: string,amount:number) => {

  return await prisma.wallet.update({
    where: { userId },
    data: {
      available: {
        decrement: amount,
      },
      pending: {
        increment: amount,
      },
    },
  });
};

export const updateWalletAvailableBalance = async (
  userId: string,
  updateType: UpdateType,
  amount: number
) => {
  return await prisma.wallet.update({
    where: { userId },
    data: {
      available: {
        [updateType]: amount,
      },
    },
  });
};

export const updateWalletApprovedBalance = async (
  userId: string,
  updateType: UpdateType,
  amount: number
) => {
  return await prisma.wallet.update({
    where: { userId },
    data: {
      approved: {
        [updateType]: amount,
      },
    },
  });
};

export const updateWalletPaidBalance = async (
  userId: string,
  updateType: UpdateType,
  amount: number
) => {
  return await prisma.wallet.update({
    where: { userId },
    data: {
      paid: {
        [updateType]: amount,
      },
    },
  });
};

export const updateWalletPendingBalance = async (
  userId: string,
  updateType: UpdateType,
  amount: number
) => {
  return await prisma.wallet.update({
    where: { userId },
    data: {
      pending: {
        [updateType]: amount,
      },
    },
  });
};

export const updateWalletCancelledBalance = async (
  userId: string,
  updateType: UpdateType,
  amount: number
) => {
  return await prisma.wallet.update({
    where: { userId },
    data: {
      cancelled: {
        [updateType]: amount,
      },
    },
  });
};
