import {Customization, CustomizationOption, Product} from "@prisma/client";
import * as customizationOptionsProvider from "../providers/customizationOptions.provider";

export const addCustomizationOption = async (customizationOption: Omit<CustomizationOption, 'id'>) => {
    return customizationOptionsProvider.createCustomizationOption(
        customizationOption.customizationId, customizationOption
    );
};

export const getCustomizationOptionsByProduct = async (product: Product) => {
    return await customizationOptionsProvider.getCustomizationOptionsByProduct(product);
}

export const getCustomizationOptionsByCustomization = async (customization: Customization) => {
    return await customizationOptionsProvider.getCustomizationOptionsByCustomization(customization);
}

export const getCustomizationOptionById = async (id: string) => {
    return await customizationOptionsProvider.getCustomizationOptionById(id);
}

export const deleteCustomizationOption = async (customizationOption: CustomizationOption) => {
    return await customizationOptionsProvider.deleteCustomizationOption(customizationOption);
}

export const deleteCustomizationOptionsByCustomization = async (customization: Customization) => {
    return await customizationOptionsProvider.deleteCustomizationOptionsByCustomization(customization);
}

export const deleteCustomizationOptionsByProduct = async (product: Product) => {
    return await customizationOptionsProvider.deleteCustomizationOptionsByProduct(product);
}

export const getAll = async (customizationId?: string, partId?: string, productId?: string, page?: number, pageSize?: number) => {
    return await customizationOptionsProvider.getAll(customizationId, partId, productId, page, pageSize);
}
