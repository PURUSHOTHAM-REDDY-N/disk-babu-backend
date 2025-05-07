import {Category} from "@prisma/client";
import * as categoriesProvider from "../providers/categories.provider";

export const createCategory = async (category: Omit<Category, 'id'>) => {
    return await categoriesProvider.createCategory(category);
}

export const getById = async (categoryId: string) => {
    return await categoriesProvider.getById(categoryId);
}

export const deleteCategory = async (category: Category) => {
    return await categoriesProvider.deleteCategory(category);
}

export const getAll = async (page?: number, pageSize?: number) => {
    return await categoriesProvider.getAll(page, pageSize);
}

export const getIdName = async () => {
    return await categoriesProvider.getIdName();
}
