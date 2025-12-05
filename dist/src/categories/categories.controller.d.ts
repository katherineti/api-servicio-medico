import { CategoriesService, ICategory } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getUsers(): Promise<ICategory[]>;
}
