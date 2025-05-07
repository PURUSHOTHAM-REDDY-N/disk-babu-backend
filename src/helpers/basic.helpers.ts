// Helper function to parse query parameters
const parseNumberOrUndefined = (param: string | undefined): number | undefined => {
    const parsed = parseInt(param as string, 10);
    return isNaN(parsed) ? undefined : parsed;
}

export const getPageAndPageSizeParams = (req: any) => {
    const page = parseNumberOrUndefined(req.query.page);
    const pageSize = parseNumberOrUndefined(req.query.pageSize);
    return {
        page: page,
        pageSize: pageSize
    }
}
