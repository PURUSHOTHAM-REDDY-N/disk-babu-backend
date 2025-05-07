import {Category} from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";


export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const result = await prisma.category.create({
        data: {
            categoryName: category.categoryName,
            categoryDescription: category.categoryDescription,
            imageLink: category.imageLink?.trim()
        }
    });

    return result;
}

export const getById = async (id: string): Promise<Category | null> => {
    const result = await prisma.category.findUnique({
        where: {
            id: id
        }
    })

    return result;
}

export const deleteCategory = async (category: Category): Promise<Category> => {
    const result = await prisma.category.delete({
        where: {
            id: category.id
        }
    })

    return result;
}

export const getAll = async (page?: number , pageSize?: number ): Promise<PagedDataResult<Category>> => {
    const paginationOptions = page !== undefined && pageSize !== undefined
        ? { skip: page * pageSize, take: pageSize }
        : {};

    // @ts-ignore
    const result = await prisma.category.findMany({
        ...paginationOptions,
    });

    const count = await prisma.category.count();
    const pagedDataResult: PagedDataResult<Category> = {
        data: result,
        total: count,
    };

    return pagedDataResult;
}

export const getIdName = async () => {


    const result = await prisma.category.findMany({
        select: {
            id: true,
            categoryName: true
        }
    });

    return result;
}
