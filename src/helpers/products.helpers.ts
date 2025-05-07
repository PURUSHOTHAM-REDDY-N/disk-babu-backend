import {Category, Customization, CustomizationOption, Part, Product, Variant} from "@prisma/client";
import {CustomizationData, PartData, VariantData} from "../models/interfaces/responses/productDataResponse";

export const getCustomizationDataItemsFromCustomizationAndOptions = (customizations: Customization[], options: CustomizationOption[]) : CustomizationData[] => {
    let customizationDataItems: CustomizationData[] = []
    customizations.map(customization => {
        let customizationItem: CustomizationData;
        const filteredOptions = options.filter(item => item.customizationId === customization.id);
        customizationItem = {...customization, options: filteredOptions}
        customizationDataItems.push(customizationItem)
    })

    return customizationDataItems;
}

export const getPartDataItemsFromPartsAndCustomizationData = (parts: Part[], customizationDataItems: CustomizationData[]) : PartData[] => {
    let partDataItems : PartData[] = [];
    parts.map(part => {
        let partDataItem: PartData;
        const filteredCustomizationDataItems = customizationDataItems.filter(item => item.partId === part.id);
        partDataItem = {...part, customizations: filteredCustomizationDataItems}
        partDataItems.push(partDataItem);
    })

    return partDataItems;
}

export const getVariantDataItemsFromVariantsAndPartDataItems = (variants: Variant[], partDataItems: PartData[]) : VariantData[] => {
    let variantDataItems : VariantData[] = [];
    variants.map(variant => {
        let variantDataItem: VariantData;
        const filteredPartDataItems = partDataItems.filter(item => item.variantId === variant.id);
        variantDataItem = {...variant, parts: filteredPartDataItems}
        variantDataItems.push(variantDataItem);
    })

    return variantDataItems;
}


export const mapCategoriesToProducts = (
    products: Product[],
    categories: Category[]
) => {
    const categoryMap = new Map(categories.map(category => [category.id, category]));

    return products.map(product => ({
        ...product,
        categories: product.categories.map(categoryId => categoryMap.get(categoryId)).filter(Boolean) as Category[]
    }));
}

