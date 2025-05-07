import {NextFunction, Request, Response, Router} from "express"
import {CustomizationOption} from "@prisma/client";
import * as customizationOptionsService from "../services/customizationOptions.service"
import * as customizationsService from "../services/customizations.service"
import * as customizationsProvider from "../providers/customizations.provider";
import * as authOptions from "../Middilewares/auth.middleware";
import * as basicHelpers from "../helpers/basic.helpers";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *    CustomizationOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89f"
 *         productId:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89f"
 *         customizationId:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89f"
 *         customizationOptionValue:
 *           type: string
 *           example: "Red"
 *         price:
 *           type: number
 *           format: float
 *           example: 0.00
 *    PagedDataResultOfCustomizationOption:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomizationOption'
 */


/**
 * @swagger
 * /customizationOptions:
 *   post:
 *     summary: Add a customization option to an existing customization
 *     tags: [CustomizationOptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customizationId:
 *                 type: string
 *                 example: "605c72c5f3e2b52534cfb89f"
 *               customizationOptionValue:
 *                 type: string
 *                 example: "Red Color"
 *               price:
 *                 type: number
 *                 example: 20.5
 *     responses:
 *       201:
 *         description: Customization option added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomizationOption'
 *       404:
 *         description: Product or Customization not found
 *       500:
 *         description: Internal server error
 */
router.post(
    '/customizationOptions',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        const {customizationId, customizationOptionValue, price } = req.body;

        const customization = await customizationsProvider.getCustomizationById(
            customizationId
        );
        if (!customization) {
            return res.status(404).json({ message: `Could not find customization with id ${customizationId}`});

        }

        const customizationOption: Omit<CustomizationOption, 'id'> = {customizationId: customizationId, productId: customization.productId, partId: customization.partId, customizationOptionValue: customizationOptionValue, price: price}
        try {
            // Call the service to add a new customization option
            const newOption = await customizationOptionsService.addCustomizationOption(
                customizationOption
            );

            return res.status(201).json(newOption);
        } catch (error: any) {
            if (error.message === 'Product or Customization not found') {
                return res.status(404).json({ message: error.message });
            }

            return res.status(500).json({ message: 'Internal server error' });
        }
    }
);

/**
 * @swagger
 * /customizationOptions/getByCustomization:
 *   get:
 *     summary: Get customization options by customization ID
 *     tags: [CustomizationOptions]
 *     parameters:
 *       - in: query
 *         name: customizationId
 *         required: true
 *         description: The ID of the customization to retrieve its options
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Customization options retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomizationOption'
 *       404:
 *         description: Customization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find customization with id 605c72c5f3e2b52534cfb890"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error: <error message>"
 */
router.get('/customizationOptions/getByCustomization',
    async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customizationId = req.query.customizationId as string;
        const customization = await customizationsService.getCustomizationById(customizationId);
        if (!customization) {
            return res.status(404).send({message: `Could not find customization with id ${customizationId}`});
        }
        const customizationOptions = await customizationOptionsService.getCustomizationOptionsByCustomization(customization);
        return res.status(200).send({...customizationOptions})
    } catch (e: any) {
        return res.status(500).send({message: `Internal server error: ${e.message}`})
    }
})


/**
 * @swagger
 * /customizationOptions/{id}:
 *   delete:
 *     summary: Delete a customization option by ID
 *     tags: [CustomizationOptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the customization option to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customization option deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomizationOption'
 *       404:
 *         description: Customization option not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Could not find customizationOption with id {id}'
 *       400:
 *         description: Error occurred during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Something went wrong while deleting the customizationOption'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'An error occurred while deleting the customizationOption: {error message}'
 */
router.delete('/customizationOptions/:id',
    authOptions.isAtLeastUser,
    async (req: Request, res: Response) => {
        const {id} = req.params;
        const customizationOption = await customizationOptionsService.getCustomizationOptionById(id);
        if(!customizationOption){
            return res.status(404).send({message: `Could not find customizationOption with id ${id}`})
        }
        try{
            const deletedCustomizationOption = await customizationOptionsService.deleteCustomizationOption(customizationOption);
            if(!deletedCustomizationOption){

                return res.status(400).send({message: 'Something went wrong while deleting the customizationOption'})
            }

            return res.status(200).send(deletedCustomizationOption)
        } catch (error: any){

            return res.status(500).send({message: `An error occurred while deleting the customizationOption. ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /customizationOptions/all:
 *   get:
 *     summary: Retrieve all customization options with pagination and filtering
 *     description: Fetches a list of customization options, optionally filtered by customization, part, or product, with pagination.
 *     tags:
 *       - CustomizationOptions
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           description: Page number for pagination (must be used with pageSize)
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           description: Number of items per page (must be used with page)
 *       - in: query
 *         name: customizationId
 *         required: false
 *         schema:
 *           type: string
 *           description: Filter by customization ID
 *       - in: query
 *         name: partId
 *         required: false
 *         schema:
 *           type: string
 *           description: Filter by part ID
 *       - in: query
 *         name: productId
 *         required: false
 *         schema:
 *           type: string
 *           description: Filter by product ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved customization options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedDataResultOfCustomizationOption'
 *       400:
 *         description: Bad Request (page and pageSize must be provided together)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Both page and pageSize must be provided or omitted"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error: {error message}"
 */
type GetAllCustomizationOptionsQueryParams = {
    page?: string,
    pageSize?: string,
    customizationId?: string,
    partId?: string,
    productId?: string,
}
router.get('/customizationOptions/all',
    async (req: Request<{}, {}, {}, GetAllCustomizationOptionsQueryParams>, res: Response, next: NextFunction) => {
        try {
            const queryParams = req.query;
            const {page, pageSize} = basicHelpers.getPageAndPageSizeParams(req);
            const customizationId = queryParams.customizationId;
            const partId = queryParams.partId;
            const productId = queryParams.productId;

            if ((page === undefined && pageSize !== undefined) || (page !== undefined && pageSize === undefined)) {
                return res.status(400).send({message: 'Both page and pageSize must be provided or omitted'});
            }

            const customizationPagedDataResult = await customizationOptionsService.getAll(customizationId, partId, productId, page, pageSize);
            return res.status(200).send(customizationPagedDataResult)
        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /customizationOptions/{customizationOptionId}:
 *   get:
 *     summary: Retrieve a customization option by ID
 *     description: Fetch details for a specific customization option using its unique identifier.
 *     tags:
 *       - CustomizationOptions
 *     parameters:
 *       - in: path
 *         name: customizationOptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the customization option to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customization option retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomizationOption'
 *       404:
 *         description: Customization option not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find customizationOption with id {customizationOptionId}"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error: {error message}"
 */
router.get('/customizationOptions/:customizationOptionId',
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const {customizationOptionId} = req.params;
            const customizationOption = await customizationOptionsService.getCustomizationOptionById(customizationOptionId);
            if(!customizationOption) {
                return res.status(404).send({message: `Could not find customizationOption with id ${customizationOptionId}`})
            }

            return res.status(200).send(customizationOption);
        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)



export default router;
