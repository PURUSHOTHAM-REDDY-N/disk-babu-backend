import {Customization, Part, Prisma, Product, Variant} from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";

export const createCustomization = async (customization: Omit<Customization, 'id'>): Promise<Customization> => {

    const result = await prisma.customization.create({
        data: {
            productId: customization.productId,
            partId: customization.partId,
            customizationType: customization.customizationType,
            customizationName: customization.customizationName,
            customizationDescription: customization.customizationDescription,
            customizationSelector: customization.customizationSelector?.trim(),
            customizationLink: customization.customizationLink?.trim(),
            customizationText: customization.customizationText
        }
    })
    return result;
}

export const getCustomizationById = async (id: string): Promise<Customization | null> => {
    const customization = await prisma.customization.findUnique({
        where: {
            id: id
        }
    })
    return customization;
}



export const getCustomizationsByProduct = async (product: Product): Promise<Customization[]> => {
    try {
        const customizations = await prisma.customization.findMany({
            where: {
                productId: product.id,
            },
        });
        return customizations;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch customizations from the database');
    }
}

export const getCustomizationsByPart = async (part: Part): Promise<Customization[]> => {
    try {
        const customizations = await prisma.customization.findMany({
            where: {
                partId: part.id,
            },
        });
        return customizations;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch customizations from the database');
    }
}

export const deleteCustomization = async (customization: Customization): Promise<Customization> => {
    const result = await prisma.customization.delete({
        where: {
            id: customization.id
        }
    });

    return result;
}

export const deleteCustomizationsByPart = async (part: Part): Promise<Prisma.BatchPayload> => {
    const result = await prisma.customization.deleteMany({
        where: {
            partId: part.id
        }
    })

    return result;
}

export const deleteCustomizationsByProduct = async (product: Product): Promise<Prisma.BatchPayload> => {
    const result = await prisma.customization.deleteMany({
            where: {
                productId: product.id
            }
        }
    )

    return  result;
}

export const getAll = async (partId?: string, productId?: string, page?: number, pageSize?: number) => {
    const paginationOptions = {
        ...(page !== undefined && pageSize !== undefined && {
            skip: page * pageSize,
            take: pageSize,
        }),
        where: {
            ...(productId && { productId: productId }),
            ...(partId && {partId: partId})
        }
    };


    const result = await prisma.customization.findMany({
        ...paginationOptions,
    });

    const count = await prisma.customization.count({
        where: {
            ...(paginationOptions.where)
        }
    });

    const pagedDataResult: PagedDataResult<Customization> = {
        data: result,
        total: count,
    };

    return pagedDataResult;
}
