import * as productsProvider from "../providers/products.provider"
import {Category, Product, Variant} from "@prisma/client";
import * as partsService from "../services/parts.service"
import * as customizationsService from "../services/customizations.service"
import * as productVariantsService from "../services/productVariants.service"

export const createProduct = async (productData: ProductRequest) => {
    return await productsProvider.createProduct(productData);
};

export const getProductById = async (id: string): Promise<Product | null> => {
    return await productsProvider.getById(id);
};

export const getProductByProductCode = async (productCode: string): Promise<Product | null> => {
    return await productsProvider.getByProductCode(productCode);
}

export const deleteProduct = async (product: Product) => {
    return await productsProvider.deleteProduct(product);
}

export const deleteVariant = async (variant: Variant) => {
    return await productVariantsService.deleteProductVariant(variant);
}



export const deleteProductAndRelatedData = async (product: Product) => {

    try {
        await customizationsService.deleteCustomizationAndOptionsByProduct(product);
    } catch (error: any) {
        throw new Error(`An error occurred while deleting customizations and options: ${error.message}`)
    }
    try {
        await partsService.deletePartsByProduct(product);
    } catch (error: any) {
        throw new Error(`An error occurred while deleting parts: ${error.message}`)
    }
    try {
        await productVariantsService.deleteByProduct(product);
    } catch (error: any) {
        throw new Error(`An error occurred while deleting variants: ${error.message}`)
    }
    try {
        await deleteProduct(product);
    } catch (error: any) {
        throw new Error(`An error occurred while delete product: ${error.message}`)
    }
}

export const getAllProducts = async (categoryId?: string, page?: number, pageSize?: number) => {
    return await productsProvider.getAllProducts(categoryId, page, pageSize);
}

export const addCategoryToProduct = async (product: Product, category: Category) => {
    return await productsProvider.addCategoryToProduct(product, category);
}

export const removeCategoryFromProduct = async (product: Product, category: Category) => {
    return await productsProvider.removeCategoryFromProduct(product, category);
}

export const deleteCategoryFromAllProducts = async (category: Category) => {

    let page = 0;
    const pageSize = 50;
    while (true) {
        const productPagedDataResult = await getAllProducts(category.id, page, pageSize);

        for (const product of productPagedDataResult.data) {
            await removeCategoryFromProduct(product, category);
        }

        if(productPagedDataResult.data.length < pageSize){
            break;
        }

        page += 1;
    }

}

export const getIdNameCategories = async () => {
    return await productsProvider.getIdNameCategories();
}
