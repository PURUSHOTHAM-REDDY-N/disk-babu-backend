import {NextFunction, Request, Response, Router} from "express"
import * as authOptions from "../Middilewares/auth.middleware";
import {Part} from "@prisma/client";
import * as partsService from "../services/parts.service"
import * as productVariantsService from "../services/productVariants.service"
import {EditPartRequest} from "../models/types/editPartRequest";

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Part:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89e"
 *         productId:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89e"
 *         variantId:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb89e"
 *         partName:
 *           type: string
 *           example: "Color"
 *         partDescription:
 *           type: string
 *           example: "Choose your preferred color."
 *         partSelector:
 *           type: string
 *           example: "dropdown"
 *         defaultColor:
 *           type: string
 *           example: "red"
 *         defaultImage:
 *           type: string
 *           example: "https://www.linktoimage.com/images/first.jpg"
 *
 *     PagedDataResultOfPart:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Part'
 */

/**
 * @swagger
 * /parts:
 *   post:
 *     summary: Add a new part to a product
 *     tags: [Parts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variantId:
 *                 type: string
 *                 example: "605c72c5f3e2b52534cfb890"
 *               partName:
 *                 type: string
 *                 example: "Sleeve"
 *                 description: "The name of the part"
 *               partDescription:
 *                 type: string
 *                 example: "A long sleeve for winter wear"
 *                 description: "A brief description of the part"
 *               partSelector:
 *                 type: string
 *                 example: "selectorName"
 *                 description: "Id used in the 3d model to select the part"
 *               defaultColor:
 *                 type: string
 *                 example: "red"
 *               defaultImage:
 *                 type: string
 *                 example: "https://www.linktoimage.com/images/first.jpg"
 *     responses:
 *       201:
 *         description: Part created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Part'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
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
router.post(
    '/parts',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {variantId, partName, partDescription, partSelector, defaultColor, defaultImage} = req.body;

        const variant = await productVariantsService.getById(variantId);
        if (!variant) {
            return res.status(404).json({message: `Could not find variant with id ${variantId} `});
        }


        const parts = await partsService.getPartsByVariant(variant);
        const existingProduct = parts.filter(part => part.partSelector == partSelector)[0];
        if (existingProduct) {
            return res.status(400).send({message: `A part with the selector ${partSelector} already exists for the provider variant.`})
        }
        const part: Omit<Part, 'id'> = {
            productId: variant.productId,
            partName: partName,
            partDescription: partDescription,
            partSelector: partSelector,
            variantId: variantId,
            defaultColor: defaultColor,
            defaultImage: defaultImage,
        };
        try {
            const result = await partsService.createPart(part);

            return res.status(201).json(result);
        } catch (error: any) {

            return res.status(500).json({message: `Internal server error: ${error.message}`});
        }
    }
);

/**
 * @swagger
 *   /parts/all:
 *     get:
 *       summary: Retrieve a paginated list of all parts
 *       description: Returns a list of parts with optional pagination.
 *       tags:
 *         - Parts
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: productId
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: variantId
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             example: 0
 *           required: false
 *           description: The page number to retrieve.
 *         - in: query
 *           name: pageSize
 *           schema:
 *             type: integer
 *             example: 10
 *           required: false
 *
 *           description: The number of parts per page.
 *       responses:
 *         '200':
 *           description: "A paged list of parts"
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/PagedDataResultOfPart'
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal service error: An unexpected error occurred."
 */
type QueryParams = {
    productId?: string;
    variantId?: string;
    page: string;
    pageSize: string;
    // Add other query parameters as needed
};
router.get('/parts/all',
    async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {

        const {productId, variantId} = req.query;
        const page = parseInt(req.query.page);
        const pageSize = parseInt(req.query.pageSize)

        if (isNaN(page) || isNaN(pageSize)) {
            return res.status(400).send({message: 'page or pageSize is not a number'});
        }

        try {
            const parts = await partsService.getAllParts(productId, variantId, page, pageSize);

            return res.status(200).send(parts);
        } catch (error: any) {

            return res.status(500).send({message: `Internal Service Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /parts/{id}:
 *   delete:
 *     summary: Delete a specific part by its ID
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the part to be deleted
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Successfully deleted the part
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Part'
 *       404:
 *         description: Part not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find part with id 605c72c5f3e2b52534cfb890"
 *       400:
 *         description: Failed to delete the part
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong while deleting the part"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the part. Internal server error."
 */
router.delete('/parts/:id',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {id} = req.params;
        const part = await partsService.getPartById(id);
        if (!part) {
            return res.status(404).send({message: `Could not find part with id ${id}`})
        }
        try {
            const deletedPart = await partsService.deletePart(part);
            if (!deletedPart) {
                return res.status(400).send({message: 'Something went wrong while deleting the part'})
            }

            return res.status(200).send(deletedPart)
        } catch (error: any) {

            return res.status(500).send({message: `An error occurred while deleting the part. ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /parts/{partId}/data:
 *   delete:
 *     summary: Delete a part and its associated customizations & customizationOptions
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partId
 *         required: true
 *         description: The ID of the part to be deleted along with its related data
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       204:
 *         description: Successfully deleted the part and its related data
 *       404:
 *         description: Part not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find part with id 605c72c5f3e2b52534cfb890"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the part data: Internal server error."
 */
router.delete(`/parts/:partId/data`,
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {partId} = req.params;
        const part = await partsService.getPartById(partId);
        if (!part) {
            return res.status(404).send({message: `Could not find part with id ${partId}`})
        }

        try {
            await partsService.deletePartAndRelatedData(part);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).send({message: `An error occurred while delete the part data: ${error.message}`})
        }
    }
)


/**
 * @swagger
 * /parts/{partId}:
 *   get:
 *     summary: Retrieve a part by ID
 *     description: Get detailed information about a specific part using its unique identifier.
 *     tags:
 *       - Parts
 *     parameters:
 *       - in: path
 *         name: partId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the part to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Part retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Part'
 *       404:
 *         description: Part not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find part with id {partId}"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal service error: {error message}"
 */
router.get('/parts/:partId',
    async (req: Request, res: Response) => {
        try {
            const {partId} = req.params;
            const part = await partsService.getPartById(partId);
            if (!part) {
                return res.status(404).send({message: `Could not find part with id ${partId}`});
            }

            return res.status(200).send(part);
        }
        catch (error: any){
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
);

/**
 * @swagger
 * paths:
 *   /parts/{partId}:
 *     put:
 *       tags:
 *         - Parts
 *       summary: Edit part details
 *       description: Allows an admin to update the default color and/or default image of a part.
 *       operationId: editPart
 *       parameters:
 *         - name: partId
 *           in: path
 *           required: true
 *           description: The ID of the part to be edited.
 *           schema:
 *             type: string
 *             example: "605c72c5f3e2b52534cfb89e"
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 defaultColor:
 *                   type: string
 *                   description: The new default color for the part.
 *                   example: "#FFFFFF"
 *                 defaultImage:
 *                   type: string
 *                   description: The URL of the new default image for the part.
 *                   example: "https://example.com/image.png"
 *       responses:
 *         '200':
 *           description: Part updated successfully.
 *           content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Part'
 *         '404':
 *           description: Part not found.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Could not find part with id 605c72c5f3e2b52534cfb89e"
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
 *       security:
 *         - bearerAuth: []
 */
router.put('/parts/:partId',
    authOptions.isAtLeastAdmin,
    async (req: Request<{partId: string}, {}, EditPartRequest>, res: Response, next: NextFunction) => {
        try {
            const defaultColor = req.body.defaultColor;
            const defaultImage = req.body.defaultImage;

            const {partId} = req.params;
            const part = await partsService.getPartById(partId);
            if (!part) {
                return res.status(404).send({message: `Could not find part with id ${partId}`})
            }

            const result = await partsService.editPart(part, {defaultColor: defaultColor, defaultImage: defaultImage})
            return res.status(200).send(result);
        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

export default router;
