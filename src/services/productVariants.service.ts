import * as productVariantsProvider from "../providers/productVariants.provider"
import {Product, Variant} from "@prisma/client";
import * as partsService from "../services/parts.service";


export const create = async (productVariant: Omit<Variant, 'id'>) => {
    return await productVariantsProvider.create(productVariant);
}

export const deleteVariantAndRelatedData = async (variant: Variant) => {
    try{

        const parts = await partsService.getPartsByVariant(variant);
        parts.forEach(part => {
            partsService.deletePartAndRelatedData(part);
        })
    }catch (error: any) {
        throw new Error(`An error occurred while deleting parts and related data: ${error.message}`)
    }
    try{
        await deleteProductVariant(variant);
    } catch (error: any) {
        throw new Error(`An error occurred while deleting the variant: ${error.message}`)
    }
}

export const getById = async (id: string): Promise<Variant | null> => {
    return await productVariantsProvider.getById(id);
}

export const deleteProductVariant = async (productVariant: Variant): Promise<Variant> => {
    return await productVariantsProvider.deleteProductVariant(productVariant);
}

export const getByProductAndVariantCode = async (product: Product, variantCode: string): Promise<Variant | null> => {
    return await productVariantsProvider.getByProductAndVariantCode(product, variantCode);
}

export const getAll = async (productId?: string, page?: number, pageSize?: number) => {
    return await productVariantsProvider.getAll(productId, page, pageSize);
}
export const deleteByProduct = async (product: Product) => {
    return await productVariantsProvider.deleteByProduct(product);
}
