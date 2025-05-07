import prisma from "../../prisma/prisma-client";
import {Category, Customization, Product} from "@prisma/client";
import {PagedDataResult} from "../models/interfaces/base/pagedDataResult";


export const createProduct = async (productData: ProductRequest) => {
    const {productCode, productName, productDescription, imageLink, categories} = productData;

    // Create a new product in the database
    const product = await prisma.product.create({
        data: {
            productCode: productCode?.trim(),
            productName,
            productDescription,
            imageLink: imageLink?.trim(),
            categories: (categories || [])
        },
    });

    return product;
};

export const getById = async (id: string): Promise<Product | null> => {
    return prisma.product.findUnique({
        where: {id}
    });
};


export const deleteProduct = async (product: Product): Promise<Product> => {
    const result = await prisma.product.delete({
        where: {
            id: product.id
        }
    })

    return result;
}

export const getByProductCode = async (productCode: string): Promise<Product | null> => {
    const result = await prisma.product.findUnique({
        where: {
            productCode: productCode
        }
    })

    return result;
}

export const getAllProducts = async (categoryId?: string, page?: number, pageSize?: number): Promise<PagedDataResult<Product>> => {
    const paginationOptions = {
        ...(page !== undefined && pageSize !== undefined && {
            skip: page * pageSize,
            take: pageSize,
        }),
        where: {
            ...(categoryId && {
                categories: {
                    has: categoryId  // Checks if the categoryId exists within the categories array
                }
            })
        }
    };

    const result = await prisma.product.findMany({
        ...paginationOptions
    });

    const count = await prisma.product.count({
        where: {
            ...(categoryId && {
                categories: {
                    has: categoryId
                }
            })
        }
    });

    const pagedDataResult: PagedDataResult<Product> = {
        data: result,
        total: count,
    };

    return pagedDataResult;
}

export const addCategoryToProduct = async (product: Product, category: Category): Promise<Product> => {
    const categories: string[] = product.categories || new Array<string>;
    categories.push(category.id);
    const result = await prisma.product.update({
        where: {
            id: product.id
        },
        data: {
           categories: categories
        }
    });

    return result;
}

export const removeCategoryFromProduct = async (product: Product, category: Category): Promise<Product> => {
    const categories = product.categories.filter(categoryId => categoryId !== category.id);
    const result = await prisma.product.update({
        where: {
            id: product.id
        },
        data: {
            categories: categories
        }
    })

    return result;
}

export const getIdNameCategories = async () => {
    const result = await prisma.product.findMany({
        select: {
            id: true,
            productName: true,
            categories: true
        }
    });

    return result;
}
