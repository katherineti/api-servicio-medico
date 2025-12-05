import { productsTable } from "../schema";
export type Product = typeof productsTable.$inferSelect;
type InsertProduct = typeof productsTable.$inferInsert;
export type CreateProduct = Omit<InsertProduct, 'id' | 'createdAt' | 'updatedAt'>;
export {};
