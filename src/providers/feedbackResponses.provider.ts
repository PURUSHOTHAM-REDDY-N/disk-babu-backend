import {FeedbackResponse} from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";


export const create = async (feedbackResponse: Omit<FeedbackResponse, 'id'>) => {
    const result = await prisma.feedbackResponse.create({
        data: feedbackResponse
    });

    return result;
}

export const getById = async (id: string) => {
    const feedbackResponse = await prisma.feedbackResponse.findUnique({
        where: {
            id: id
        }
    });

    return feedbackResponse;
}


export const getAll = async (page?: number, pageSize?: number) => {
    const paginationOptions = page !== undefined && pageSize !== undefined
        ? { skip: page * pageSize, take: pageSize }
        : {};

    // @ts-ignore
    const result = await prisma.feedbackResponse.findMany({
        ...paginationOptions,
    });

    const count = await prisma.feedbackResponse.count();
    const pagedDataResult: PagedDataResult<FeedbackResponse> = {
        data: result,
        total: count,
    };

    return pagedDataResult;
}
