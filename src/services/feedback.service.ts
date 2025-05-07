import {FeedbackQuestion, FeedbackResponse} from "@prisma/client";
import * as feedbackQuestionsProvider from "../providers/feedbackQuestions.provider"
import * as feedbackResponsesProvider from "../providers/feedbackResponses.provider"


export const createFeedbackQuestion = async (feedbackQuestion: Omit<FeedbackQuestion, 'id'>) => {
    return await feedbackQuestionsProvider.create(feedbackQuestion);
}

export const getFeedbackQuestionById = async (id: string) => {
    return await feedbackQuestionsProvider.getById(id);
}

export const getAllFeedbackQuestionsPaged = async (page?: number, pageSize?: number) => {
    return await feedbackQuestionsProvider.getAll(page, pageSize);
}

export const createFeedbackResponse = async (feedbackResponse: Omit<FeedbackResponse, 'id'>) => {
    return await feedbackResponsesProvider.create(feedbackResponse);
}

export const getFeedbackResponseById = async (id: string) => {
    return await feedbackResponsesProvider.getById(id);
}

export const getAllFeedbackResponsesPaged = async (page?: number, pageSize?: number) => {
    return await feedbackResponsesProvider.getAll(page, pageSize);
}

export const deleteFeedbackQuestion = async (feedbackQuestion: FeedbackQuestion) => {
    return await feedbackQuestionsProvider.deleteFeedbackQuestion(feedbackQuestion);
}
