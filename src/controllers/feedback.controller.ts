import {NextFunction, Request, Response, Router} from "express";
import * as authOptions from "../Middilewares/auth.middleware"
import * as enumsConverter from "../helpers/enums.converters"
import {FeedbackQuestionResponse, FeedbackQuestionType} from "@prisma/client";
import * as feedbackServices from "../services/feedback.service"
import * as usersService from "../services/users.service"
import * as basicHelpers from "../helpers/basic.helpers";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FeedbackQuestionType:
 *       type: string
 *       enum:
 *         - MVP_GENERAL
 *       description: "Type of feedback question."
 *
 *     FeedbackQuestion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "Unique identifier for the feedback question."
 *           example: "64a7f8c5a9b82e001a2d1234"
 *         question:
 *           type: string
 *           description: "The text of the feedback question."
 *           example: "What do you think of our MVP?"
 *         type:
 *           $ref: '#/components/schemas/FeedbackQuestionType'
 *       required:
 *         - id
 *         - question
 *         - type
 *       description: "A feedback question for the MVP."
 *
 *     FeedbackQuestionResponse:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           description: "The text of the feedback question."
 *           example: "What do you think of our MVP?"
 *         questionId:
 *           type: string
 *           description: "Identifier of the associated question."
 *           example: "64a7f8c5a9b82e001a2d5678"
 *         response:
 *           type: string
 *           description: "The user's response to the question."
 *           example: "I think it’s a great start!"
 *       required:
 *         - question
 *         - questionId
 *         - response
 *       description: "User's response to a specific feedback question."
 *
 *     FeedbackResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "Unique identifier for the feedback response."
 *           example: "64a7f8c5a9b82e001a2d9101"
 *         responses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FeedbackQuestionResponse'
 *           description: "List of responses to feedback questions."
 *         userId:
 *           type: string
 *           nullable: true
 *           description: "Optional user identifier if the response is associated with a registered user."
 *           example: "64a7f8c5a9b82e001a2d3456"
 *         email:
 *           type: string
 *           nullable: true
 *           description: "Optional email address of the respondent."
 *           example: "user@example.com"
 *       required:
 *         - id
 *         - responses
 *       description: "Collection of responses to feedback questions from a single user or respondent."
 *     PagedDataResultOfFeedbackQuestion:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeedbackQuestion'
 *     PagedDataResultOfFeedbackResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeedbackResponse'
 */

/**
 * @swagger
 * /feedback/question:
 *     post:
 *       summary: Create a new feedback question
 *       description: Creates a new feedback question with the specified question text and type. Only accessible by admin users.
 *       tags:
 *         - Feedback
 *       security:
 *         - bearerAuth: [] # Assuming `auth` is a JWT bearer token middleware
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: string
 *                   description: "The text of the feedback question."
 *                   example: "What is your feedback on the MVP?"
 *                 type:
 *                   $ref: '#/components/schemas/FeedbackQuestionType'
 *               required:
 *                 - question
 *                 - type
 *       responses:
 *         '200':
 *           description: Feedback question created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/FeedbackQuestion'
 *         '400':
 *           description: Bad Request - missing or invalid question or type
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Question & type are required"
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal Server Error: An error occurred while creating feedback question."
 */
router.post('/feedback/question',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {question, type} = req.body;
            if (!question || !type) {
                return res.status(400).send({message: 'Question & type are required'});
            }
            const feedbackType: FeedbackQuestionType | undefined = enumsConverter.toFeedbackQuestionType(type);
            if (!feedbackType) {
                return res.status(400).send({message: `FeedbackQuestionType ${type} is invalid.`});
            }

            const response = await feedbackServices.createFeedbackQuestion({
                question: question,
                type: feedbackType
            });

            return res.status(201).send(response);

        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
);

/**
 * @swagger
 *   /feedback/response:
 *     post:
 *       summary: Submit feedback responses
 *       description: Allows a user to submit responses to feedback questions. Either `email` or `userId` is required.
 *       tags:
 *         - Feedback
 *       security:
 *         - bearerAuth: [] # Assuming `auth` is a JWT bearer token middleware
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: "Optional email of the respondent."
 *                   example: "user@example.com"
 *                 userId:
 *                   type: string
 *                   description: "Optional user ID if the respondent is a registered user."
 *                   example: "64a7f8c5a9b82e001a2d3456"
 *                 responses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeedbackQuestionResponse'
 *                   description: "List of feedback question responses."
 *               required:
 *                 - responses
 *       responses:
 *         '200':
 *           description: Feedback responses submitted successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: "Unique identifier for the feedback response record."
 *                     example: "64a7f8c5a9b82e001a2d9101"
 *                   email:
 *                     type: string
 *                     nullable: true
 *                     description: "Email of the respondent, if provided."
 *                     example: "user@example.com"
 *                   userId:
 *                     type: string
 *                     nullable: true
 *                     description: "User ID of the respondent, if provided."
 *                     example: "64a7f8c5a9b82e001a2d3456"
 *                   responses:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/FeedbackQuestionResponse'
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: "Timestamp when the feedback response was created."
 *                     example: "2024-11-01T15:20:30Z"
 *         '400':
 *           description: Bad Request - either email or userId is required
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Either email or userId is required"
 *         '404':
 *           description: User not found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Cannot find any user with id {userId}"
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal Server Error: An error occurred while submitting feedback response."
 */
type FeedbackResponseRequest = {
    email?: string;
    userId?: string
    responses: FeedbackQuestionResponse[];
}
router.post('/feedback/response',
    async (req: Request<{}, {}, FeedbackResponseRequest>, res: Response, next: NextFunction) => {
        try {
            const {email, userId, responses} = req.body;
            // if (!email && !userId) {
            //     res.status(400).send({message: 'Either email or userId is required'});
            // }

            //TODO: Validate all the question ids in responses

            if (userId) {
                const user = usersService.getAccountDetailsByAccountId(userId!);
                if (!user) {
                    res.status(404).send({message: `Cannot find any user with id ${user}`})
                }
            }

            const response = await feedbackServices.createFeedbackResponse({
                userId: userId || null,
                email: email || null,
                responses: responses
            });

            return res.status(201).send(response);
        } catch (error: any) {
            res.status(500).send({message: `Internal Server Error: ${error.message}`});
        }
    }
);

/**
 * @swagger
 * /feedback/questions/all:
 *     get:
 *       summary: Retrieve all feedback questions
 *       description: |
 *         Retrieves a list of all feedback questions. Supports pagination through `page` and `pageSize` query parameters.
 *         If either `page` or `pageSize` is provided, both must be supplied. Only accessible by authenticated users.
 *       tags:
 *         - Feedback
 *       parameters:
 *         - name: page
 *           in: query
 *           description: "Page number for pagination (must be a positive integer)."
 *           required: false
 *           schema:
 *             type: integer
 *             example: 0
 *         - name: pageSize
 *           in: query
 *           description: "Number of items per page for pagination (must be a positive integer)."
 *           required: false
 *           schema:
 *             type: integer
 *             example: 10
 *       responses:
 *         '200':
 *           description: Successfully retrieved feedback questions
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/PagedDataResultOfFeedbackQuestion'
 *         '400':
 *           description: Bad Request - Invalid query parameters
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Both page and pageSize must be provided or omitted"
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal Service Error: An error occurred while retrieving feedback questions."
 *       security:
 *         - BearerAuth: []  # Assumes a security scheme named "BearerAuth" is defined for authenticated access
 */
type GetAllQuestionsParams = {
    page?: string;
    pageSize?: string
}
router.get('/feedback/questions/all',
    async (req: Request<{}, {}, {}, GetAllQuestionsParams>, res: Response, next: NextFunction) => {
        try {
            const {page, pageSize} = basicHelpers.getPageAndPageSizeParams(req);

            if ((page === undefined && pageSize !== undefined) || (page !== undefined && pageSize === undefined)) {
                return res.status(400).send({message: 'Both page and pageSize must be provided or omitted'});
            }

            const data = await feedbackServices.getAllFeedbackQuestionsPaged(page, pageSize);
            return res.status(200).send(data);
        } catch (error: any) {
            return res.status(500).send({message: `Internal Service Error: ${error.message}`})
        }

    }
)

/**
 * @swagger
 *   /feedback/responses/all:
 *     get:
 *       summary: Get all feedback responses with optional pagination
 *       description: Retrieves a list of all feedback responses. If pagination is used, both `page` and `pageSize` must be provided.
 *       tags:
 *         - Feedback
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *           description: "The page number for pagination. Must be provided along with pageSize."
 *           example: 0
 *         - in: query
 *           name: pageSize
 *           schema:
 *             type: integer
 *           description: "The number of items per page. Must be provided along with page."
 *           example: 10
 *       responses:
 *         '200':
 *           description: A list of feedback responses with pagination.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/PagedDataResultOfFeedbackResponse'
 *         '400':
 *           description: Bad Request - both page and pageSize must be provided or omitted.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Both page and pageSize must be provided or omitted."
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal Service Error: An error occurred while retrieving feedback responses."
 */
type GetAllFeedbackResponsesParams = {
    page?: string;
    pageSize?: string
}
router.get('/feedback/responses/all',
    async (req: Request<{}, {}, {}, GetAllFeedbackResponsesParams>, res: Response, next: NextFunction) => {
        try {
            const {page, pageSize} = basicHelpers.getPageAndPageSizeParams(req);

            if ((page === undefined && pageSize !== undefined) || (page !== undefined && pageSize === undefined)) {
                return res.status(400).send({message: 'Both page and pageSize must be provided or omitted'});
            }

            const data = await feedbackServices.getAllFeedbackResponsesPaged(page, pageSize);
            return res.status(200).send(data);
        } catch (error: any) {
            return res.status(500).send({message: `Internal Service Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * paths:
 *   /feedback/question/{feedbackQuestionId}:
 *     delete:
 *       tags:
 *         - Feedback
 *       summary: Delete a feedback question
 *       description: Deletes a feedback question by its ID. Returns `204 No Content` on successful deletion.
 *       operationId: deleteFeedbackQuestion
 *       parameters:
 *         - name: feedbackQuestionId
 *           in: path
 *           required: true
 *           description: The ID of the feedback question to delete.
 *           schema:
 *             type: string
 *             example: "64a7f8c5a9b82e001a2d3456"
 *       responses:
 *         '204':
 *           description: Feedback question deleted successfully. No content returned.
 *         '400':
 *           description: Invalid or missing `feedbackQuestionId`.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Feedback Question ID is required"
 *         '404':
 *           description: Feedback question not found.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Could not find Feedback Question with id 12345"
 *         '500':
 *           description: Internal server error.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal Server Error: An unexpected error occurred"
 */
router.delete('/feedback/question/:feedbackQuestionId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {feedbackQuestionId} = req.params;
            const feedbackQuestion = await feedbackServices.getFeedbackQuestionById(feedbackQuestionId);
            if(!feedbackQuestion) {
                return res.status(404).send({message: `Could not find Feedback Question with id ${feedbackQuestionId}`})
            }
            const response = await feedbackServices.deleteFeedbackQuestion(feedbackQuestion);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

export default router;
