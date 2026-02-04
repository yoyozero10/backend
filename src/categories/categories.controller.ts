import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * API 10/37: GET /categories [MVP]
     * Lấy danh sách tất cả categories
     */
    @Get()
    async findAll() {
        return this.categoriesService.findAll();
    }
}
