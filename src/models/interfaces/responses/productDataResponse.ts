import {Category, Customization, CustomizationOption, Part, Product, Variant} from "@prisma/client";

export interface ProductDataResponse extends ProductWithVariants{
    variants: VariantData[]
}

export interface ProductWithVariants extends Product{
    variants: Variant[]
}

export interface VariantData extends Variant {
    parts: PartData[]
}

export interface PartData extends Part{
    customizations: CustomizationData[]
}

export interface CustomizationData extends Customization{
    options: CustomizationOption[]
}

export interface ProductWithCategories extends Omit<Product, 'categories'> {
    categories: Category[]
}
