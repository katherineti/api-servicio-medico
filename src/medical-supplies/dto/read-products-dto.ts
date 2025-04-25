import { Product } from "src/db/types/products.types";

export class ProductsGetAll {
  total: number;
  page: number;
  list: Product[];
}