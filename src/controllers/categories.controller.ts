import {NextFunction, Request, Response, Router} from "express";
import * as categoriesService from "../services/categories.service"
import * as productsService from "../services/products.service";
import * as authOptions from "../Middilewares/auth.middleware"
import * as basicHelpers from "../helpers/basic.helpers";
import * as categoriesHelpers from "../helpers/categories.helpers";
import {CategoryData} from "../models/interfaces/responses/categoryDataResponse";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";

const router = Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "Unique identifier for the category."
 *         categoryName:
 *           type: string
 *           description: "The name of the category."
 *         categoryDescription:
 *           type: string
 *           description: "A brief description of the category."
 *         imageLink:
 *           type: string
 *           description: "URL of the category's image."
 *       required:
 *         - id
 *         - categoryName
 *
 *     CategoryData:
 *       allOf:
 *         - $ref: '#/components/schemas/Category'
 *         - type: object
 *           properties:
 *             products:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *
 *     PagedDataResultOfCategory:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *
 *     PagedDataResultOfCategoryData:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryData'
 */


/**
 * @swagger
 * /categories:
 *     post:
 *       summary: Create a new category
 *       description: Endpoint to create a new category in the system.
 *       tags:
 *         - Categories
 *       security:
 *         - bearerAuth: [] # Assuming `auth` is a JWT bearer token middleware
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoryName:
 *                   type: string
 *                   description: "The name of the category."
 *                 categoryDescription:
 *                   type: string
 *                   description: "A brief description of the category."
 *                 imageLink:
*                    type: string
*                    description: "URL of the category's image."
 *               required:
 *                 - categoryName
 *             example:
 *               categoryName: "Mens"
 *               categoryDescription: "Contains clothing for Men."
 *               imageLink: "https:image.link.com/image.jpg"
 *       responses:
 *         '201':
 *           description: Category created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Category'
 *         '400':
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *               examples:
 *                 missingCategoryName:
 *                   summary: Category name is missing
 *                   value:
 *                     message: "categoryName field is required"
 *                 creationFailed:
 *                   summary: Category creation failed
 *                   value:
 *                     message: "Failed to create category."
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                 example:
 *                   message: "Internal Server Error: An unexpected error occurred"
 */
router.post('/categories',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {categoryName, categoryDescription, imageLink} = req.body;
        if(!categoryName){

            return res.status(400).send({message: 'categoryName field is required'})
        }
        try {
            const category = await categoriesService.createCategory({
                categoryName: categoryName,
                categoryDescription: categoryDescription,
                imageLink: imageLink
            });
            if(!category){

                return res.status(400).send({message: 'Failed to create category.'});
            }

            return res.status(201).send(category);
        } catch (error: any){

            return res.status(500).send({message: `Internal Server Error: ${error.message}`});
        }
    }
)

/**
 * @swagger
 * /categories/{categoryId}:
 *     delete:
 *       summary: Delete a category
 *       description: Deletes a specified category and removes its association from all products.
 *       tags:
 *         - Categories
 *       security:
 *         - bearerAuth: [] # Assuming `auth` is a JWT bearer token middleware
 *       parameters:
 *         - name: categoryId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *           description: "The ID of the category to delete."
 *       responses:
 *         '200':
 *           description: Successfully deleted the category
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Category deleted successfully"
 *                   category:
 *                     $ref: '#/components/schemas/Category'
 *         '400':
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *               examples:
 *                 missingCategoryId:
 *                   summary: Required category ID missing
 *                   value:
 *                     message: "categoryId is required"
 *         '404':
 *           description: Not Found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *               examples:
 *                 categoryNotFound:
 *                   summary: Category not found
 *                   value:
 *                     message: "Could not find Category with id {categoryId}"
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *               examples:
 *                 internalError:
 *                   summary: General internal error
 *                   value:
 *                     message: "Internal Server Error: An unexpected error occurred"
 *                 removeAssociationError:
 *                   summary: Error removing category from products
 *                   value:
 *                     message: "An error occurred while removing the category from products"
 */
router.delete('/categories/:categoryId',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {categoryId} = req.params;
        if(!categoryId){

            return res.status(400).send({message: 'categoryId is required'})
        }
        try{
            const category = await categoriesService.getById(categoryId);
            if(!category){

                return res.status(404).send({message: `Could not find Category with id ${categoryId}`})
            }
            const result = await categoriesService.deleteCategory(category);
            try{
                await productsService.deleteCategoryFromAllProducts(category);
            } catch (error: any){
                return res.status(500).send({message: `An error occurred while removing the category from products: ${error.message}`})
            }
            return res.status(200).send(result);
        } catch (error: any){

            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /categories/all:
 *     get:
 *       summary: Retrieve paginated list of categories
 *       description: Returns a paginated list of categories with the specified page and pageSize query parameters.
 *       tags:
 *         - Categories
 *       security:
 *         - bearerAuth: [] # Assuming `auth` is a JWT bearer token middleware
 *       parameters:
 *         - name: page
 *           in: query
 *           schema:
 *             type: integer
 *           description: "The page number of the results to retrieve."
 *         - name: pageSize
 *           in: query
 *           schema:
 *             type: integer
 *           description: "The number of items per page."
 *       responses:
 *         '200':
 *           description: "A paged list of parts"
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/PagedDataResultOfCategory'
 *         '400':
 *           description: Bad Request - Invalid page or pageSize parameter
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *               examples:
 *                 invalidParams:
 *                   summary: Invalid query parameters
 *                   value:
 *                     message: "page or pageSize is not a number"
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *               example:
 *                 message: "Internal Service Error: An unexpected error occurred."
 */
type QueryParams = {
    page: string;
    pageSize: string;
}
router.get('/categories/all',
    async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
        try {
            const {page, pageSize} = basicHelpers.getPageAndPageSizeParams(req);

            // If only one of `page` or `pageSize` is defined, return a 400 Bad Request error
            if ((page === undefined && pageSize !== undefined) || (page !== undefined && pageSize === undefined)) {
                return res.status(400).send({ message: 'Both page and pageSize must be provided or omitted' });
            }

            const data = await categoriesService.getAll(page, pageSize);
            return res.status(200).send(data);
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            return res.status(500).send({ message: `Internal Service Error: ${error.message}` });
        }
    }
)
/**
 * @swagger
 * /categories/data/all:
 *   get:
 *     summary: Retrieve all categories with their associated products.
 *     description: Fetches a paginated list of categories, each containing a list of associated products.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: The page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *         required: false
 *         description: The number of items per page for pagination.
 *     responses:
 *       200:
 *         description: A paginated list of categories with their associated products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedDataResultOfCategoryData'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error: An unexpected error occurred."
 *
 */
type GetAllCategoryDataQueryParams = {
    page?: string,
    pageSize?: string
}
router.get('/categories/data/all',
    async (req: Request<{}, {}, {}, GetAllCategoryDataQueryParams>, res: Response, next: NextFunction) => {
        try {
            const {page, pageSize} = basicHelpers.getPageAndPageSizeParams(req);

            if ((page === undefined && pageSize !== undefined) || (page !== undefined && pageSize === undefined)) {
                return res.status(400).send({ message: 'Both page and pageSize must be provided or omitted' });
            }
            const categories = await categoriesService.getAll(page, pageSize);
            const products = await productsService.getAllProducts();
            const categoryData = categoriesHelpers.mapProductsToCategories(categories.data, products.data);
            const pagedDataResultOfCategoryData: PagedDataResult<CategoryData> = {
                data: categoryData,
                total: categoryData.length
            };
            return res.status(200).send(pagedDataResultOfCategoryData);
        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * paths:
 *   /categories/navbar/data:
 *     get:
 *       summary: Get Categories with Associated Products for Navbar
 *       description: Fetches categories along with their associated products, formatted for use in the navbar.
 *       tags:
 *         - Categories
 *       responses:
 *         '200':
 *           description: Successfully retrieved categories and products data.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: string
 *                       description: Unique identifier for the category.
 *                       example: "67326c354c490f71e191f043"
 *                     categoryName:
 *                       type: string
 *                       description: Name of the category.
 *                       example: "Women"
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             description: Unique identifier for the product.
 *                             example: "67358ee1fa584e783256ce27"
 *                           productName:
 *                             type: string
 *                             description: Name of the product.
 *                             example: "Lehenga"
 *         '500':
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *                     example: "Internal Server Error: An unexpected error occurred."
 */
router.get('/categories/navbar/data',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await categoriesService.getIdName();
            const products = await productsService.getIdNameCategories();
            const data = categoriesHelpers.groupProductsByCategoryForNavbarData(categories, products);
            return res.status(200).send(data);
        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

export default router;
