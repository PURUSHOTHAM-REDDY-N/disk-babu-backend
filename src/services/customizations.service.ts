import {Customization, Part, Product} from "@prisma/client";
import * as customizationsProvider from "../providers/customizations.provider"
import * as customizationOptionsService from "../services/customizationOptions.service"


export const createCustomization = async (customization: Omit<Customization, 'id'>) => {
    return customizationsProvider.createCustomization(customization);
}

export const getCustomizationById = async (id: string)=> {
    return customizationsProvider.getCustomizationById(id);
}

export const getCustomizationsByProduct = async (product: Product) => {
    return await customizationsProvider.getCustomizationsByProduct(product);
}

export const getCustomizationsByPart = async (part: Part) => {
    return await customizationsProvider.getCustomizationsByPart(part);
}

export const deleteCustomization = async (customization: Customization) => {
    return await customizationsProvider.deleteCustomization(customization);
}

export const deleteCustomizationsByPart = async (part: Part) => {
    return await customizationsProvider.deleteCustomizationsByPart(part);
}

export const deleteCustomizationAndOptionsByProduct = async (product: Product) => {
    await customizationsProvider.deleteCustomizationsByProduct(product);
    await customizationOptionsService.deleteCustomizationOptionsByProduct(product);
}

export const deleteCustomizationAndRelatedData = async (customization: Customization) => {
    try{
        await customizationOptionsService.deleteCustomizationOptionsByCustomization(customization);
    } catch (error: any) {
        throw new Error('An error occurred while deleting customizationOptions')
    }
    try{
        await deleteCustomization(customization)
    } catch (error: any) {

    }
}

export const getAll = async (partId?: string, productId?: string, page?: number, pageSize?: number) => {
    return customizationsProvider.getAll(partId, productId, page, pageSize);
}
