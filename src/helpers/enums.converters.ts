import {FeedbackQuestionType} from "@prisma/client";


export const toFeedbackQuestionType = (value: string): FeedbackQuestionType | undefined => {
    switch (value) {
        case  FeedbackQuestionType.MVP_GENERAL.toString() :
            return FeedbackQuestionType.MVP_GENERAL;
        default :
            return undefined
    }
}
