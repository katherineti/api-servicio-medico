import { Controller, Get } from '@nestjs/common';
import { CategoriesService, ICategory } from './categories.service';

@Controller('categories')
export class CategoriesController {
      constructor(private readonly categoriesService: CategoriesService) { }
    
      @Get('getAll')
      getUsers( ): Promise<ICategory[]> {
        return this.categoriesService.getAll();
      }
}