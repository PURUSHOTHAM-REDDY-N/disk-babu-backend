import {Customization, CustomizationOption, Prisma, Product} from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";

export const createCustomizationOption = async (
    customizationId: string,
    input: Omit<CustomizationOption, 'id'>
) => {
    return prisma.customizationOption.create({
        data: {
            customizationId,
            productId: input.productId,
            partId: input.partId,
            customizationOptionValue: input.customizationOptionValue?.trim(),
            price: input.price,
        },
    });
};

export const getCustomizationOptionsByProduct = async (product: Product): Promise<CustomizationOption[]> => {
    try {
        const customizationOptions = await prisma.customizationOption.findMany({
            where: {
                productId: product.id
            }
        })
        return customizationOptions;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch customization options from the database')
    }
}

export const getCustomizationOptionsByCustomization = async (customization: Customization): Promise<CustomizationOption[]> => {
    try {
        const customizationOptions = await prisma.customizationOption.findMany({
            where: {
                customizationId: customization.id
            }
        })
        return customizationOptions;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch customization options from the database')
    }
}

export const deleteCustomizationOption = async (customizationOption: CustomizationOption): Promise<CustomizationOption> => {
    const result = await prisma.customizationOption.delete({
        where: {
            id: customizationOption.id
        }
    });

    return result;
}

export const deleteCustomizationOptionsByCustomization = async (customization: Customization): Promise<Prisma.BatchPayload> => {
    const result = await prisma.customizationOption.deleteMany({
        where: {
            customizationId: customization.id
        }
    })

    return result;
}

export const getCustomizationOptionById = async (id: string): Promise<CustomizationOption | null> => {
    const result = await prisma.customizationOption.findUnique(
        {
            where: {
                id: id
            }
        })

    return result;
}

export const deleteCustomizationOptionsByProduct = async (product: Product): Promise<Prisma.BatchPayload> => {
    const result = await prisma.customizationOption.deleteMany({
        where: {
            productId: product.id
        }
    })

    return result;
}

export const getAll = async (customizationId?: string, partId?: string, productId?: string, page?: number, pageSize?: number) => {
    const paginationOptions = {
        ...(page !== undefined && pageSize !== undefined && {
            skip: page * pageSize,
            take: pageSize,
        }),
        where: {
            ...(customizationId && {customizationId: customizationId}),
            ...(partId && {partId: partId}),
            ...(productId && { productId: productId })
        }
    };


    const result = await prisma.customizationOption.findMany({
        ...paginationOptions
    })

    const count = await prisma.customizationOption.count({
        where: {
            ...(paginationOptions.where),
        }
    })


    const pagedDataResult: PagedDataResult<CustomizationOption> = {
        data: result,
        total: count
    }

    return pagedDataResult
}
