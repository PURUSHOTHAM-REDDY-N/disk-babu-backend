import {NextFunction, Request, Response, Router} from "express"
import * as productsService from "../services/products.service"
import * as authOptions from "../Middilewares/auth.middleware";
import * as customizationOptionsService from "../services/customizationOptions.service"
import * as customizationsService from "../services/customizations.service"
import {
    CustomizationData,
    PartData,
    ProductDataResponse,
    ProductWithCategories,
    VariantData
} from "../models/interfaces/responses/productDataResponse";
import * as partsService from "../services/parts.service"
import * as productsHelpers from "../helpers/products.helpers"
import * as categoriesService from "../services/categories.service"
import * as productVariantsService from "../services/productVariants.service"
import * as designRoomProductsService from "../services/designRoomProducts.service"
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";
import {DesignRoomProduct} from "@prisma/client";

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb890"
 *         productCode:
 *           type: string
 *           example: "SKU12345"
 *         productName:
 *           type: string
 *           example: "T-Shirt"
 *         productDescription:
 *           type: string
 *           example: "A comfortable cotton t-shirt."
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *             example: "605c72c5f3e2b52534cfb890k"
 *         imageLink:
 *           type: string
 *           example: "https://example.com/image/link"
 *
 *     ProductWithVariants:
 *       allOf:
 *         - $ref: '#/components/schemas/Product'
 *         - type: object
 *           properties:
 *             variants:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Variant'
 *
 *     Variant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: ObjectId
 *           example: "694a72c5g3e2b52534cfb890k"
 *         variantCode:
 *           type: string
 *           example: "VAR123"
 *         variantName:
 *           type: string
 *           example: "Red T-Shirt"
 *         variantDescription:
 *           type: string
 *           example: "A vibrant red t-shirt."
 *         modelLink:
 *           type: string
 *           example: "https://example.com/model/link"
 *         price:
 *           type: number
 *           format: float
 *           example: 19.99
 *         imageLink:
 *           type: string
 *           example: "https://example.com/image/link"
 *         imageCoordinates:
 *           type: object
 *           $ref: '#/components/schemas/Coordinates'
 *
 *
 *     ProductDataResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Product'
 *         - type: object
 *           properties:
 *             variants:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VariantData'
 *
 *     VariantData:
 *       allOf:
 *         - $ref: '#/components/schemas/Variant'
 *         - type: object
 *           properties:
 *             parts:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PartData'
 *
 *     PartData:
 *       allOf:
 *         - $ref: '#/components/schemas/Part'
 *         - type: object
 *           properties:
 *             customizations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomizationData'
 *
 *     CustomizationData:
 *       allOf:
 *         - $ref: '#/components/schemas/Variant'
 *         - type: object
 *           properties:
 *             options:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomizationOption'
 *
 *     ProductWithCategories:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/Product'
 *         - type: object
 *           properties:
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *               example:
 *                 - id: "123"
 *                   categoryName: "Electronics"
 *                   categoryDescription: "All electronic items"
 *                   imageLink: "https://example.com/image.jpg"
 *
 *     Coordinates:
 *       type: object
 *       properties:
 *         x:
 *           type: number
 *           format: float
 *           example: 30
 *         y:
 *           type: number
 *           format: float
 *           example: 80
 *         z:
 *           type: number
 *           format: float
 *           example: 20
 *
 *
 *     DesignRoomProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "Unique identifier for the design room product"
 *         productName:
 *           type: string
 *           description: "Name of the product"
 *         imageLink:
 *           type: string
 *           nullable: true
 *           description: "URL of the product image"
 *         color:
 *           type: string
 *           description: "Color of the product"
 *         additionalNotes:
 *           type: string
 *           description: "Additional notes for the product"
 *         measurements:
 *           type: object
 *           description: "Custom measurements for the product"
 *           properties:
 *             hands:
 *               type: integer
 *               example: 20
 *             neck:
 *               type: integer
 *               example: 20
 *             shoulders:
 *               type: integer
 *               example: 30
 *             units:
 *               type: string
 *               enum: ["in", "cm"]
 *               description: "Units for the measurements, either inches or centimeters"
 *
 *
 *     PagedDataResult_Template:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/GenericType" # Placeholder for type substitution
 *         total:
 *           type: integer
 *           description: "The total number of items available for pagination"
 *       required:
 *         - data
 *         - total
 *
 *     PagedDataResultOfProduct:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *
 *     PagedDataResultOfProductWithCategories:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductWithCategories'
 *
 *
 *     PagedDataResultOfDesignRoomProduct:
 *       allOf:
 *         - $ref: '#/components/schemas/PagedDataResult_Template'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DesignRoomProduct'
 *
 *
 *     GenericType:
 *       type: object
 *
 */


/**
 * @swagger
 * /products/create-product:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productCode:
 *                 type: string
 *                 example: "SKU12345"
 *               productName:
 *                 type: string
 *                 example: "T-Shirt"
 *               productDescription:
 *                 type: string
 *                 example: "A comfortable cotton t-shirt."
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:  ["605c72c5f3e2b52534cfb890e"]
 *               imageLink:
 *                 type: string
 *                 example: "https://example.com/image/link"
 *             required:
 *               - productCode
 *               - productName
 *               - productDescription
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/products/create-product',
    authOptions.isAtLeastAdmin,
    async (req: Request<{}, {}, ProductRequest>, res: Response, next: NextFunction) => {
        try{
            const {productCode, productName, productDescription, categories, imageLink} = req.body;

            if (categories) {
                for (const categoryId of categories) {
                    let category = await categoriesService.getById(categoryId);
                    if (!category) {
                        return res.status(404).send({message: `Could not find category with id ${categoryId}`})
                    }
                }
            }

            if (!productCode || !productName || !productDescription) {
                return res.status(400).json({message: 'All fields are required.'});
            }

            const existingProduct = await productsService.getProductByProductCode(productCode);
            if (existingProduct) {
                return res.status(400).send({message: 'ProductCode must be unique. A product already exists with the provided productCode.'})
            }

            try {
                const product = await productsService.createProduct({
                    productCode,
                    productName,
                    productDescription,
                    categories,
                    imageLink
                });

                return res.status(201).json(product);
            } catch (error) {
                console.error(error);
                return res.status(500).json({message: 'An error occurred while creating the product.'});
            }
        } catch (error: any) {
            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
});

/**
 * @swagger
 *   /products/all:
 *     get:
 *       summary: Retrieve a paginated list of all products
 *       description: Returns a list of products with optional pagination.
 *       tags:
 *         - Products
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: categoryId
 *           schema:
 *             type: string
 *           required: false
 *           description: The id of the category to filter products
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
 *           description: The number of products per page.
 *       responses:
 *         '200':
 *           description: A list of products.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/PagedDataResultOfProductWithCategories'
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
    categoryId?: string;
    page: string;
    pageSize: string;
    // Add other query parameters as needed
};
router.get('/products/all',
    async (req: Request<{}, {}, any, QueryParams>, res: Response) => {

        const {categoryId} = req.query;
        const page = parseInt(req.query.page);
        const pageSize = parseInt(req.query.pageSize)

        if(isNaN(page) || isNaN(pageSize)){

            return res.status(400).send({message: 'page or pageSize is not a number'})
        }

        try {
            const products = await productsService.getAllProducts(categoryId, page, pageSize);
            const categories = await categoriesService.getAll();

            const productsWithCategories = productsHelpers.mapCategoriesToProducts(products.data, categories.data);

            const pagedDataResultOfProductWithCategories: PagedDataResult<ProductWithCategories> = {
                data: productsWithCategories,
                total: products.total
            }

            return res.status(200).send(pagedDataResultOfProductWithCategories);
        } catch (error: any     ){

            return res.status(500).send({message: `Internal Service Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to retrieve
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/products/:id',
    async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const product = await productsService.getProductById(id);

        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }

        return res.status(200).json(product);
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({message: 'Internal server error'});
    }
})


/**
 * @swagger
 * /products/{id}/variants:
 *   post:
 *     summary: Add a variant to an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to add a variant to
 *         schema:
 *           type: string
 *           format: ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variantCode:
 *                 type: string
 *                 example: "VAR456"
 *               variantName:
 *                 type: string
 *                 example: "Blue T-Shirt"
 *               variantDescription:
 *                 type: string
 *                 example: "A cool blue t-shirt."
 *               modelLink:
 *                 type: string
 *                 example: "https://example.com/model/link"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 24.99
 *               imageLink:
 *                 type: string
 *                 example: "https://example.com/image/link"
 *               imageCoordinates:
 *                 type: object
 *                 $ref: '#/components/schemas/Coordinates'
 *
 *     responses:
 *       200:
 *         description: Product Variant added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Variant'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Variant with code VAR456 already exists
 *       500:
 *         description: Internal server error
 */
router.post('/products/:id/variants', authOptions.isAtLeastAdmin, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {variantCode, variantName, variantDescription, modelLink, price, imageLink, imageCoordinates} = req.body;

        let product = await productsService.getProductById(id);
        if (!product) {
            return res.status(404).json({message: 'Product not found'})
        }
        let variant = await productVariantsService.getByProductAndVariantCode(product, variantCode);

        if (variant) {
            return res.status(400).json({message: `Variant with code ${variantCode} already exists+`})
        }

        variant = await productVariantsService.create({
            productId: product.id,
            variantCode,
            variantName,
            variantDescription,
            modelLink,
            price,
            imageLink,
            imageCoordinates
        });

        if (!variant) {
            return res.status(404).json({message: 'Could not add variant to the product'});
        }

        return res.status(201).json(variant);
    } catch (error) {
        return res.status(500).json({message: 'Internal server error. '});
    }
})

/**
 * @swagger
 * /products/{id}/data:
 *   get:
 *     summary: Get a detailed product item by ID including customizations and variants
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to retrieve the detailed item
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Product item retrieved successfully, including customizations and variants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductDataResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find product with id 605c72c5f3e2b52534cfb890"
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
router.get('/products/:id/data',
    async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;
        const product = await productsService.getProductById(id);
        if (!product) {
            return res.status(404).send({message: `Could not find product with id ${id}`})
        }
        try {

            const customizations = await customizationsService.getCustomizationsByProduct(product);

            const customizationOptions = await customizationOptionsService.getCustomizationOptionsByProduct(product);

            const parts = await partsService.getPartsByProduct(product.id);

            let variants = await productVariantsService.getAll(product.id);

            let customizationDataItems: CustomizationData[] = productsHelpers.getCustomizationDataItemsFromCustomizationAndOptions(customizations, customizationOptions);

            let partDataItems: PartData[] = productsHelpers.getPartDataItemsFromPartsAndCustomizationData(parts, customizationDataItems);

            let variantDataItems: VariantData[] = productsHelpers.getVariantDataItemsFromVariantsAndPartDataItems(variants.data, partDataItems);

            const productData: ProductDataResponse = {...product, variants: variantDataItems}

            return res.status(200).json(productData);
        } catch (error: any) {

            return res.status(500).send({message: `Internal server error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /products/variants/{variantId}/data:
 *   get:
 *     summary: Get a detailed data of specific variant by productId & variantCode
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         description: The ID of the variant to retrieve the detailed item
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Product item retrieved successfully, including customizations and variants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VariantData'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find product with id 605c72c5f3e2b52534cfb890"
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
router.get('/products/variants/:variantId/data',
    async (req: Request, res: Response, next: NextFunction) => {
        const {variantId} = req.params;

        const variant = await productVariantsService.getById(variantId);
        if(!variant) {
            return res.status(404).send({message: `Could not find variant with id ${variantId}`})
        }

        const product = await productsService.getProductById(variant.productId);
        if(!product) {
            return res.status(500).send({message: 'Something went wrong. The provided variant does not have a valid productId'});
        }

        try {
            let variantData: VariantData;

            const customizations = await customizationsService.getCustomizationsByProduct(product);
            const customizationOptions = await customizationOptionsService.getCustomizationOptionsByProduct(product);
            const parts = await partsService.getPartsByVariant(variant);

            let customizationDataItems: CustomizationData[] = productsHelpers.getCustomizationDataItemsFromCustomizationAndOptions(customizations, customizationOptions);
            let partDataItems: PartData[] = productsHelpers.getPartDataItemsFromPartsAndCustomizationData(parts, customizationDataItems);

            variantData = {...variant, parts: partDataItems};

            return res.status(200).json(variantData);
        } catch (error: any) {

            return res.status(500).send({message: `Internal server error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to be deleted
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product with id 605c72c5f3e2b52534cfb890 not found"
 *       400:
 *         description: Bad request or error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong while deleting the product"
 *       500:
 *         description: Internal server error during the deletion process
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the product. <error message>"
 */
router.delete('/products/:id',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;
        const product = await productsService.getProductById(id);
        if (!product) {
            return res.status(404).send({message: `Product with id ${id} not found`})
        }
        try {
            const deletedProduct = await productsService.deleteProduct(product);
            if (!deletedProduct) {
                return res.status(400).send({message: 'Something went wrong while deleting the product'})
            }

            return res.status(200).send(deletedProduct)
        } catch (error: any) {

            return res.status(500).send({message: `An error occurred while deleting the product. ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /products/variants/{variantId}:
 *   delete:
 *     summary: Delete a variant from a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product that contains the variant
 *         schema:
 *           type: string
 *           format: ObjectId
 *       - in: path
 *         name: variantCode
 *         required: true
 *         description: The unique code of the variant to be deleted
 *         schema:
 *           type: string
 *           example: "VAR12345"
 *     responses:
 *       200:
 *         description: Variant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Variant'
 *       404:
 *         description: Product or variant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find product with id 605c72c5f3e2b52534cfb890"
 *       500:
 *         description: Internal server error while deleting the variant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the variant: <error message>"
 */
router.delete(`/products/variants/:variantId`,
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {variantId} = req.params;
        let variant = await productVariantsService.getById(variantId);
        if (!variant) {
            return res.status(404).send({message: `Could not find variant with id ${variantId}`})
        }
        try{
            const result = await productVariantsService.deleteProductVariant(variant);
            return res.status(200).send(result);
        } catch (error: any){
            return res.status(500).send({message: `An error occurred while delete the variant: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /products/variants/{variantId}/data:
 *   delete:
 *     summary: Delete a variant, it's associated parts, customizations & customization options
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         description: The ID of the variant.
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "605c72c5f3e2b52534cfb890"
 *     responses:
 *       204:
 *         description: Variant and its related data deleted successfully
 *       404:
 *         description: Product or variant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find product with id 605c72c5f3e2b52534cfb890"
 *       500:
 *         description: Internal server error while deleting the variant and its related data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the variant data: <error message>"
 */
router.delete(`/products/variants/:variantId/data`,
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {variantId} = req.params;
        let variant = await productVariantsService.getById(variantId);
        if (!variant) {
            return res.status(404).send({message: `Could not find variant with id ${variantId}`})
        }
        try{
            await productVariantsService.deleteVariantAndRelatedData(variant);
            return res.status(204).send();
        } catch (error: any){
            return res.status(500).send({message: `An error occurred while delete the variant data: ${error.message}`})
        }
    }
)


/**
 * @swagger
 * /products/{productId}/data:
 *   delete:
 *     summary: Delete a product, it's associated variants, parts, customizations & customizationOptions
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to be deleted, along with all its related data
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       204:
 *         description: Product and its related data successfully deleted
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not find product with id 605c72c5f3e2b52534cfb890"
 *       500:
 *         description: Internal server error while deleting the product and its related data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the product data: <error message>"
 */
router.delete(`/products/:productId/data`,
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        const {productId} = req.params;
        const product = await productsService.getProductById(productId);
        if(!product){
            return res.status(404).send({message: `Could not find product with id ${productId}`})
        }

        try{
            await productsService.deleteProductAndRelatedData(product);
            return res.status(204).send();
        } catch (error: any){
            return res.status(500).send({message: `An error occurred while delete the product data: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /products/{productId}/add-category:
 *     post:
 *       summary: Add a category to a product
 *       description: Assigns an existing category to a specific product.
 *       tags:
 *         - Products
 *       security:
 *         - bearerAuth: [] # Assuming `auth` is a JWT bearer token middleware
 *       parameters:
 *         - name: productId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *           description: "The ID of the product to which the category will be added."
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoryId:
 *                   type: string
 *                   description: "The ID of the category to add to the product."
 *               required:
 *                 - categoryId
 *             example:
 *               categoryId: "63cd38e66ff5577bc14ac8af"
 *       responses:
 *         '200':
 *           description: Category successfully added to the product
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   $ref: '#/components/schemas/Product'
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
 *                 missingParameters:
 *                   summary: Required fields missing
 *                   value:
 *                     message: "productId or categoryId are required"
 *                 categoryAlreadyExists:
 *                   summary: Category already associated with product
 *                   value:
 *                     message: "Product {productId} already contains the given category {categoryId}"
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
 *                 productNotFound:
 *                   summary: Product not found
 *                   value:
 *                     message: "Could not find product with id {productId}"
 *                 categoryNotFound:
 *                   summary: Category not found
 *                   value:
 *                     message: "Could not find category with id {categoryId}"
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
router.post('/products/:productId/add-category',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        try {
            const {productId} = req.params;
            const {categoryId} = req.body;
            if(!productId || !categoryId){
                return res.status(400).send({message: 'productId or categoryId are required'});
            }
            const product = await productsService.getProductById(productId);
            if(!product){

                return res.status(404).send({message: `Could not find product with id ${productId}`})
            }
            const category = await categoriesService.getById(categoryId);
            if(!category){

                return res.status(404).send({message: `Could not find category with id ${categoryId}`})
            }

            const categoryExists = product.categories.filter(idString => idString === categoryId).length > 0;
            if(categoryExists){
                return res.status(400).send({message: `Product ${productId} already contains the given category ${categoryId}`})
            }
            const result = await productsService.addCategoryToProduct(product, category);

            return res.status(200).send(result);
        } catch (error: any) {

            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * /products/{productId}/categories/{categoryId}:
 *     delete:
 *       summary: Remove a category from a product
 *       description: Deletes an association between a product and a category.
 *       tags:
 *         - Products
 *       security:
 *         - bearerAuth: [] # Assuming `auth` is a JWT bearer token middleware
 *       parameters:
 *         - name: productId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *           description: "The ID of the product."
 *         - name: categoryId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *           description: "The ID of the category to remove from the product."
 *       responses:
 *         '200':
 *           description: Successfully removed the category from the product
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Category removed successfully"
 *                   product:
 *                     $ref: '#/components/schemas/Product'
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
 *                 missingParameters:
 *                   summary: Required fields missing
 *                   value:
 *                     message: "productId or categoryId are required"
 *                 categoryNotInProduct:
 *                   summary: Category not associated with product
 *                   value:
 *                     message: "Product {productId} does not contain the given category {categoryId}"
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
 *                 productNotFound:
 *                   summary: Product not found
 *                   value:
 *                     message: "Could not find product with id {productId}"
 *                 categoryNotFound:
 *                   summary: Category not found
 *                   value:
 *                     message: "Could not find category with id {categoryId}"
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
router.delete('/products/:productId/categories/:categoryId',
    authOptions.isAtLeastAdmin,
    async (req: Request, res: Response) => {
        try {
            const {productId, categoryId} = req.params;
            if(!productId || !categoryId){
                return res.status(400).send({message: 'productId or categoryId are required'});
            }
            const product = await productsService.getProductById(productId);
            if(!product){

                return res.status(404).send({message: `Could not find product with id ${productId}`})
            }
            const category = await categoriesService.getById(categoryId);
            if(!category){

                return res.status(404).send({message: `Could not find category with id ${categoryId}`})
            }

            const categoryExists = product.categories.filter(idString => idString === categoryId).length > 0;
            if(!categoryExists){
                return res.status(400).send({message: `Product ${productId} does not contain the given category ${categoryId}`})
            }
            const result = await productsService.removeCategoryFromProduct(product, category);

            return res.status(200).send(result);
        } catch (error: any) {

            return res.status(500).send({message: `Internal Server Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 * paths:
 *   /products/design-room:
 *     post:
 *       tags:
 *         - Products
 *       summary: "Create a new DesignRoomProduct"
 *       description: "Creates a new product in the design room with specified attributes including name, color, additional notes, and measurements."
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productName:
 *                   type: string
 *                   description: "Name of the design room product"
 *                 imageLink:
 *                   type: string
 *                   nullable: true
 *                   description: "URL of the product image (optional)"
 *                 color:
 *                   type: string
 *                   description: "Color of the product"
 *                 additionalNotes:
 *                   type: string
 *                   description: "Additional notes for the product"
 *                 measurements:
 *                   type: object
 *                   properties:
 *                     hands:
 *                       type: number
 *                       description: "Measurement of hands"
 *                     neck:
 *                       type: number
 *                       description: "Measurement of neck"
 *                     shoulders:
 *                       type: number
 *                       description: "Measurement of shoulders"
 *                     units:
 *                       type: string
 *                       enum: [in, cm]
 *                       description: "Units for measurements (inches or centimeters)"
 *       responses:
 *         '201':
 *           description: "DesignRoomProduct created successfully"
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/DesignRoomProduct'
 *         '500':
 *           description: "Internal Server Error"
 */
router.post('/products/design-room',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { productName, imageLink, color, additionalNotes, measurements } = req.body;

            // Create a new DesignRoomProduct
            const newProduct = await designRoomProductsService.create(
               {
                    productName,
                    imageLink,
                    color,
                    additionalNotes,
                    measurements, // Storing measurements as JSON

            });

            res.status(201).json(newProduct);
        } catch (error: any) {
            console.error('Error creating DesignRoomProduct:', error);
            res.status(500).json({ message: `Internal Server Error: ${error.message}` });
        }
    }
)

/**
 * @swagger
 * paths:
 *   /products/design-room/all:
 *     get:
 *       tags:
 *         - Products
 *       summary: Retrieve all design room products with pagination
 *       description: Fetches a paginated list of all design room products.
 *       parameters:
 *         - in: query
 *           name: page
 *           required: true
 *           schema:
 *             type: number
 *             example: 0
 *           description: The page number to retrieve (starts from 0).
 *         - in: query
 *           name: pageSize
 *           required: true
 *           schema:
 *             type: number
 *             example: 10
 *           description: The number of products to retrieve per page.
 *       responses:
 *         '200':
 *           description: Successfully retrieved paginated design room products.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 $ref: '#/components/schemas/PagedDataResultOfDesignRoomProduct'
 *
 *         '400':
 *           description: Invalid query parameters (e.g., non-numeric page or pageSize).
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "page or pageSize is not a number"
 *         '500':
 *           description: Internal server error.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Internal Service Error: <error-message>"
 */
type GetAllDesignRoomProductsQueryParams = {
    page: string,
    pageSize: string
}
router.get('/products/design-room/all',
    async (req: Request<{}, {}, any, GetAllDesignRoomProductsQueryParams>, res: Response) => {

        try {
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize)

            if (isNaN(page) || isNaN(pageSize)) {

                return res.status(400).send({message: 'page or pageSize is not a number'})
            }

            const designRoomProductPagedDataResult = await designRoomProductsService.getAll( page, pageSize);

            return res.status(200).send(designRoomProductPagedDataResult);
        } catch (error: any) {

            return res.status(500).send({message: `Internal Service Error: ${error.message}`})
        }
    }
)

/**
 * @swagger
 *   paths:
 *     /products/design-room/{designRoomProductId}:
 *       get:
 *         tags:
 *           - Products
 *         summary: "Retrieve a DesignRoomProduct by ID"
 *         description: "Fetches details of a specific DesignRoomProduct by its unique ID."
 *         parameters:
 *           - in: path
 *             name: designRoomProductId
 *             required: true
 *             schema:
 *               type: string
 *             description: "ID of the DesignRoomProduct to retrieve"
 *         responses:
 *           '200':
 *             description: "A DesignRoomProduct object"
 *             content:
 *               application/json:
 *                 schema:
 *                   $ref: '#/components/schemas/DesignRoomProduct'
 *           '404':
 *             description: "DesignRoomProduct not found"
 *           '500':
 *             description: "Internal Server Error"
 */
router.get('/products/design-room/:designRoomProductId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {designRoomProductId} = req.params;
            const designRoomProduct = await designRoomProductsService.getById(designRoomProductId);
            if(!designRoomProduct) {
                return res.status(404).send({message: `Could not find DesignRoomProduct with id ${designRoomProductId}`})
            }
            res.status(200).json(designRoomProduct);
        } catch (error: any) {
            console.error('Error retrieving DesignRoomProduct:', error);
            res.status(500).json({ message: `Internal Server Error: ${error.message}` });
        }
    }
)



export default router;
