import {Product, Variant} from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";


export const create = async (productVariant: Omit<Variant, 'id'>): Promise<Variant> => {
    const result = await prisma.variant.create({
        data: {
            productId: productVariant.productId,
            imageLink: productVariant.imageLink?.trim(),
            modelLink: productVariant.modelLink?.trim(),
            price: productVariant.price,
            variantCode: productVariant.variantCode?.trim(),
            variantName: productVariant.variantName,
            variantDescription: productVariant.variantDescription,
            imageCoordinates: productVariant.imageCoordinates
        }
    });

    return result;
}

export const getById = async (id: string): Promise<Variant | null> => {
    const productVariant = await prisma.variant.findUnique({
        where: {
            id: id
        }
    });

    return productVariant;
}

export const deleteProductVariant = async (productVariant: Variant): Promise<Variant> => {
    const result = await prisma.variant.delete({
        where: {
            id: productVariant.id
        }
    });

    return result;
}

export const getByProductAndVariantCode = async (product: Product, variantCode: string): Promise<Variant | null> => {
    const productVariant = await prisma.variant.findFirst({
        where: {
            productId: product.id,
            variantCode: variantCode
        }
    });

    return productVariant;
}

export const getAll = async (productId?: string, page?: number, pageSize?: number): Promise<PagedDataResult<Variant>> => {
    const paginationOptions = {
        ...(page !== undefined && pageSize !== undefined && {
            skip: page * pageSize,
            take: pageSize,
        }),
        where: {
            ...(productId && { productId: productId })
        }
    };

    // @ts-ignore
    const result = await prisma.variant.findMany({
        ...paginationOptions,
    });

    const count = await prisma.variant.count({
        where: {
            ...(productId && { productId })
        }
    });

    const pagedDataResult: PagedDataResult<Variant> = {
        data: result,
        total: count,
    };

    return pagedDataResult;
}

export const deleteByProduct = async (product: Product) => {
    const result = await prisma.variant.deleteMany({
        where: {
            productId: product.id
        }
    });

    return result;
}
