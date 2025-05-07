import prisma from "../../prisma/prisma-client";
import {DesignRoomProduct, FeedbackQuestion} from "@prisma/client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";


export const create = async (designRoomProduct: Omit<DesignRoomProduct, 'id'>): Promise<DesignRoomProduct> => {
    const result = await prisma.designRoomProduct.create({
        data: {
            productName: designRoomProduct.productName,
            color: designRoomProduct.color?.trim(),
            additionalNotes: designRoomProduct.additionalNotes,
            imageLink: designRoomProduct.imageLink?.trim(),
            measurements: designRoomProduct.measurements!
        }
    });

    return result;
}

export const getById = async (id: string): Promise<DesignRoomProduct | null> => {
    const designRoomProduct = await prisma.designRoomProduct.findUnique({
        where: {
            id: id
        }
    });

    return designRoomProduct;
}

export const getAll = async (page?: number, pageSize?: number): Promise<PagedDataResult<DesignRoomProduct>> => {
    const paginationOptions = page !== undefined && pageSize !== undefined
        ? { skip: page * pageSize, take: pageSize }
        : {};

    // @ts-ignore
    const result = await prisma.designRoomProduct.findMany({
        ...paginationOptions,
    });

    const count = await prisma.designRoomProduct.count();
    const pagedDataResult: PagedDataResult<DesignRoomProduct> = {
        data: result,
        total: count,
    };

    return pagedDataResult;
}

