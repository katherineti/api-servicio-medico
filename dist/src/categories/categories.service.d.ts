import { NeonDatabase } from 'drizzle-orm/neon-serverless';
export interface ICategory {
    id: number;
    name: string;
    type: string;
    created_at: Date;
    updated_at: Date;
}
export declare class CategoriesService {
    private db;
    constructor(db: NeonDatabase);
    getAll(): Promise<ICategory[]>;
    getById(id: number): Promise<ICategory | undefined>;
}
