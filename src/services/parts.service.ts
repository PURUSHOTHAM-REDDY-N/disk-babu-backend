import * as partsProvider from "../providers/parts.provider"
import {Part, Product, Variant} from "@prisma/client";
import * as customizationsService from "../services/customizations.service"
import * as customizationOptionsService from "../services/customizationOptions.service"
import {EditPartRequest} from "../models/types/editPartRequest";

export const createPart = async (part: Omit<Part, 'id'>) => {
    return await partsProvider.createPart(part);
}

export const getPartById = async (id: string) => {
    return await partsProvider.getPartById(id);
}

export const getPartsByVariant = async (variant: Variant) => {
    return await partsProvider.getPartsByVariant(variant);
}

export const getPartsByProduct = async (productId: string): Promise<Part[]> => {
    return await partsProvider.getPartsByProduct(productId);
}

export const deletePart = async (part: Part) => {
    return await partsProvider.deletePart(part);
}

export const deletePartsByVariant = async (variant: Variant) => {
    return await partsProvider.deletePartsByVariant(variant);
}

export const deletePartsByProduct = async (product: Product) => {
    return await partsProvider.deletePartsByProduct(product);
}

export const deletePartAndRelatedData = async (part: Part) => {
    try {
        const customizations = await customizationsService.getCustomizationsByPart(part);
        customizations.forEach(customization => {
            customizationOptionsService.deleteCustomizationOptionsByCustomization(customization);
        })
    } catch (error: any) {
        throw new Error(`An error occurred while delete customizationOptions: ${error.message}`)
    }

    try {
        await customizationsService.deleteCustomizationsByPart(part);
    } catch (error: any) {
        throw new Error(`An error occurred while deleting customizations: ${error.message}`)
    }

    try {
        await deletePart(part);
    } catch (error: any) {
        throw new Error(`An error occurred while deleting part: ${error.message}`)
    }

}

export const getAllParts = (productId?: string, variantId?: string, page: number = 0, pageSize: number = 10) => {
    return partsProvider.getAllParts(productId, variantId, page, pageSize);
}

export const editPart = async (part: Part, editPartRequest: EditPartRequest) => {
    return await partsProvider.editPart(part, editPartRequest);
}
