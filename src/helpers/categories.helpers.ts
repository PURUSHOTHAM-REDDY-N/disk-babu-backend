import {Category, Product} from "@prisma/client";

export const mapProductsToCategories = (categories: Category[], products: Product[]) => {

    const categoryProductMap: Record<string, Product[]> = {};

    products.forEach(product => {
        product.categories.forEach(categoryId => {
            if (!categoryProductMap[categoryId]) {
                categoryProductMap[categoryId] = [];
            }
            categoryProductMap[categoryId].push(product);
        });
    });

    const categoryWithProducts = categories.map(category => ({
        ...category,
        products: categoryProductMap[category.id] || []
    }));

    return categoryWithProducts;
};

export const groupProductsByCategoryForNavbarData = (categories: any[], products: any[]) => {
    return categories.map((category) => {
        const categoryProducts = products
            .filter((product) => product.categories.includes(category.id))
            .map((product) => ({
                productId: product.id,
                productName: product.productName,
            }));

        return {
            categoryId: category.id,
            categoryName: category.categoryName,
            products: categoryProducts,
        };
    });
};
