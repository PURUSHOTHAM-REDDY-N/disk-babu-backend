import {DesignRoomProduct} from "@prisma/client";
import * as designRoomProductsProvider from "../providers/designRoomProducts.provider"

export const create = async (designRoomProduct: Omit<DesignRoomProduct, 'id'>) => {
    return await designRoomProductsProvider.create(designRoomProduct);
}

export const getById = async (id: string) => {
    return await  designRoomProductsProvider.getById(id);
}

export const getAll = async (page?: number, pageSize?: number) => {
    return await designRoomProductsProvider.getAll(page, pageSize);
}
