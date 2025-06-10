import { Product } from "src/db/types/products.types";

export interface ProductExpired extends Product {
  isExpired: boolean;
}

export class ProductsExpiredGetAll {
  total: number;
  page: number;
  list: ProductExpired[];
}