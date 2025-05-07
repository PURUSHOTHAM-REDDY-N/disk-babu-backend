/**
 * @swagger
 * components:
 *   schemas:
 *     PagedDataResult:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             additionalProperties: true # Allows for generic type T
 *         total:
 *           type: integer
 *           description: "The total number of items available for pagination"
 *       required:
 *         - data
 *         - total
 * */
export interface PagedDataResult<T> {
    data: Array<T>;
    total: Number;
}
