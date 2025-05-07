import {Category, Product} from "@prisma/client";

export interface CategoryData extends Category {
    products: Product[];
}
