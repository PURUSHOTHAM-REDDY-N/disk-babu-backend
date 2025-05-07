import {NextFunction, Request, Response, Router} from "express"
import * as authOptions from "../Middilewares/auth.middleware";
import {Customization} from "@prisma/client";
import * as customizationsService from "../services/customizations.service"
import * as partsService from "../services/parts.service"
import * as basicHelpers from "../helpers/basic.helpers"

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *    Customization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89k"
 *         productId:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89k"
 *         partId:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89k"
 *         customizationName:
 *           type: string
 *           example: "Color"
 *         customizationDescription:
 *           type: string
 *           example: "Choose your preferred color."
 *         customizationSelector:
 *           type: string
 *           example: "dropdown"
 *         customizationType:
 *           type: string
 *           enum: [Predefined, Link, Text]
 *           example: "Predefined"
 *         customizationLink:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         customizationText:
 *           type: string
 *           example: "Select a color option."
 *    PagedDataResultOfCustomization:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customization'
 */


/**
 * @swagger
 * /customizations:
 *   post:
 *     summary: Add a new customization to a product part
 *     tags: [Customizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partId:
 *                 type: string
 *                 example: "605c72c5f3e2b52534cfb89k"
 *                 description: "The id of the target part"
 *               customizationName:
 *                 type: string
 *                 example: "Color"
 *                 description: "The name of the customization"
 *               customizationDescription:
 *                 type: string
 *                 example: "Allows the user to choose the color of the part"
 *                 description: "A brief description of the customization"
 *               customizationSelector:
 *                 type: string
 *                 example: "dropdown"
 *                 description: "How the customization is selected (dropdown, radio, etc.)"
 *               customizationType:
 *                 type: string
 *                 enum: ["Predefined", "Link", "Text"]
 *                 example: "Predefined"
 *                 description: "The type of customization"
 *     responses:
 *       201:
 *         description: Customization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customization'
 *       404:
 *         description: Part not found or could not add customization to the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Part not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error. <error message>"
 */
router.post('/customizations', authOptions.isAtLeastAdmin, async (req: Request, res: Response, next: NextFunction) => {
    const {partId, customizationName, customizationDescription, customizationSelector, customizationType} = req.body;

    const part = await partsService.getPartById(partId);
    if (!part) {
        return res.status(404).json({message: 'Part not found'})
    }
    const customization: Omit<Customization, 'id'> = {
        productId: part.productId,
        partId: partId,
        customizationName: customizationName,
        customizationDescription: customizationDescription,
        customizationSelector: customizationSelector,
        customizationType: customizationType,
        customizationLink: null,
        customizationText: null
    };

    try {
        const result = await customizationsService.createCustomization(customization);

        if (!result) {
            return res.status(404).json({message: 'Could not add customization to the product'});
        }

        return res.status(201).json(result);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal server error. '});
    }
})

/**
 * @swagger
 * /customizations/{id}:
 *   delete:
 *     summary: Delete a customization by ID
 *     tags: [Customizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the customization to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customization deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customization'
 *       400:
 *         description: Something went wrong while deleting the customization
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Something went wrong while deleting the customization'
 *       404:
 *         description: Customization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Could not find customization with id {id}'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'An error occurred while deleting the customization. {error message}'
 */
router.delete('/customizations/:id',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {id} = req.params;
        const customization = await customizationsService.getCustomizationById(id);
        if (!customization) {
            return res.status(404).send({message: `Could not find customization with id ${id}`})
        }
        try {
            const deletedCustomization = await customizationsService.deleteCustomization(customization);
            if (!deletedCustomization) {
                return res.status(400).send({message: 'Something went wrong while deleting the customization'})
            }

            return res.status(200).send(deletedCustomization)
        } catch (error: any) {

            return res.status(500).send({message: `An error occurred while deleting the customization. ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /customizations/{id}/data:
 *   delete:
 *     summary: Delete customization and its related data by ID
 *     tags: [Customizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the customization whose data is to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Customization and related data deleted successfully
 *       404:
 *         description: Customization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Could not find customization with id {id}'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'An error occurred while deleting the customization data: {error message}'
 */
router.delete(`/customizations/:id/data`,
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {id} = req.params;
        const customization = await customizationsService.getCustomizationById(id);
        if (!customization) {
            return res.status(404).send({message: `Could not find customization with id ${id}`})
        }
        try {
            await customizationsService.deleteCustomizationAndRelatedData(customization);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).send({message: `An error occurred while delete the customization data: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /customizations/all:
 *   get:
 *     summary: Retrieve all customizations with pagination and filtering
 *     description: Fetches a list of customizations, optionally filtered by part or product, with pagination.
 *     tags:
 *       - Customizations
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           description: Page number for pagination (must be used with pageSize)
 *           example: 0
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           description: Number of items per page (must be used with page)
 *           example: 10
 *       - in: query
 *         name: partId
 *         required: false
 *         schema:
 *           type: string
 *           description: Filter by part ID
 *           example: "605c72c5f3e2b52534cfb890"
 *       - in: query
 *         name: productId
 *         required: false
 *         schema:
 *           type: string
 *           description: Filter by product ID
 *           example: "605c72c5f3e2b52534cfb891"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved customizations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedDataResultOfCustomization'

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
type GetAllCustomizationsQueryParams = {
    page?: string,
    pageSize?: string,
    partId?: string,
    productId?: string
}
router.get('/customizations/all',
    async (req: Request<{}, {}, {}, GetAllCustomizationsQueryParams>, res: Response, next: NextFunction) => {
        try {
            const queryParams = req.query;
            const {page, pageSize} = basicHelpers.getPageAndPageSizeParams(req);
            const partId = queryParams.partId;
            const productId = queryParams.productId;

            if ((page === undefined && pageSize !== undefined) || (page !== undefined && pageSize === undefined)) {
                return res.status(400).send({message: 'Both page and pageSize must be provided or omitted'});
            }

            const customizationPagedDataResult = await customizationsService.getAll(partId, productId, page, pageSize);
            return res.status(200).send(customizationPagedDataResult)
        } catch (error: any) {
            res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /customizations/{customizationId}:
 *   get:
 *     summary: Retrieve a customization by ID
 *     description: Fetch details for a specific customization using its unique identifier.
 *     tags:
 *       - Customizations
 *     parameters:
 *       - in: path
 *         name: customizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the customization to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customization retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customization'
 *       404:
 *         description: Customization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find customization with id {customizationId}"
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
router.get('/customizations/:customizationId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {customizationId} = req.params;
            const customization = await customizationsService.getCustomizationById(customizationId);
            if (!customization) {
                return res.status(404).send({message: `Could not find customization with id ${customizationId}`})
            }

            return res.status(200).send(customization);
        } catch (error: any) {

            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)


export default router;
