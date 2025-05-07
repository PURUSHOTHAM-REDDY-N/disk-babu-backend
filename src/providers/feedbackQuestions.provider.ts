import prisma from "../../prisma/prisma-client";
import {FeedbackQuestion} from "@prisma/client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";
import awsConfig from "../../aws.config";


export const create = async (feedbackQuestion: Omit<FeedbackQuestion, 'id'>) => {
    const result = await prisma.feedbackQuestion.create({
        data: {
            question: feedbackQuestion.question,
            type: feedbackQuestion.type
        }
    })

    return result;
}

export const getById = async (id: string): Promise<FeedbackQuestion | null> => {
    const feedbackQuestion = await prisma.feedbackQuestion.findUnique({
        where: {
            id: id
        }
    })

    return feedbackQuestion;
}

export const getAll = async (page?: number, pageSize?: number) => {
    const paginationOptions = page !== undefined && pageSize !== undefined
        ? { skip: page * pageSize, take: pageSize }
        : {};

    // @ts-ignore
    const result = await prisma.feedbackQuestion.findMany({
        ...paginationOptions,
    });

    const count = await prisma.feedbackQuestion.count();
    const pagedDataResult: PagedDataResult<FeedbackQuestion> = {
        data: result,
        total: count,
    };

    return pagedDataResult;
}

export const deleteFeedbackQuestion = async (feedbackQuestion: FeedbackQuestion) => {
    const result = await prisma.feedbackQuestion.delete({
        where: {
            id: feedbackQuestion.id
        }
    });

    return result;
}
