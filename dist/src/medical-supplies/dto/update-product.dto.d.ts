import { TypesProducts } from 'src/db/enums/types-products';
export declare class UpdateProductDto {
    url_image: string;
    name: string;
    description: string;
    code: string;
    stock: number;
    categoryId: number;
    type: TypesProducts;
    statusId: number;
}
