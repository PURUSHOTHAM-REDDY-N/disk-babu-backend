import {Part, Prisma, Product, Variant} from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";
import {EditPartRequest} from "../models/types/editPartRequest";

export const createPart = async (part: Omit<Part, 'id'>): Promise<Part> => {

    const result = await prisma.part.create({
        data: {
            productId: part.productId,
            variantId: part.variantId,
            partName: part.partName,
            partDescription: part.partDescription,
            partSelector: part.partSelector?.trim(),
            defaultColor: part.defaultColor?.trim(),
            defaultImage: part.defaultImage?.trim()
        }
    })

    return result;
}

export const getPartById = async (id: string): Promise<Part | null> => {
    const result = await prisma.part.findUnique({
        where: {
            id: id
        }
    })

    return result;
}

export const getPartsByProduct = async (productId: string): Promise<Part[]> => {
    const result = await prisma.part.findMany({
        where: {
            productId: productId
        }
    })

    return result;
}

export const getPartsByVariant = async (variant: Variant) => {
    const result = await prisma.part.findMany({
        where: {
            variantId: variant.id
        }
    });

    return result;
}

export const deletePart = async (part: Part): Promise<Part> => {
    const result = await prisma.part.delete({
        where: {
            id: part.id
        }
    })

    return result
}

export const deletePartsByVariant = async (variant: Variant): Promise<Prisma.BatchPayload> => {
    const result = await prisma.part.deleteMany({
        where: {
            variantId: variant.id
        }
    })

    return result;
}

export const deletePartsByProduct = async (product: Product): Promise<Prisma.BatchPayload> => {
    const result = await prisma.part.deleteMany({
        where: {
            productId: product.id
        }
    })

    return result;
}


export const getAllParts = async (productId?: string, variantId?: string, page: number = 0, pageSize: number = 10): Promise<PagedDataResult<Part>> => {
    const skip = page * pageSize;
    const result = await prisma.part.findMany({
        skip: skip,
        take: pageSize,
        where: {
            productId: productId,
            variantId: variantId
        }
    })
    const count = await prisma.part.count({
        where: {
            productId: productId,
            variantId: variantId
        }
    })
    const pagedDataResult: PagedDataResult<Part> = {
        data: result,
        total: count
    }

    return pagedDataResult;
}

export const editPart = async (part: Part, editPartRequest: EditPartRequest) => {

    const result = await prisma.part.update({
        where: {id: part.id},
        data: {
            defaultColor: editPartRequest.defaultColor,
            defaultImage: editPartRequest.defaultImage
        }
    })

    return result;
}
