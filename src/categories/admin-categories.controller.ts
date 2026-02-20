import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminCategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * API 27/37: POST /admin/categories [MVP]
     * Tạo danh mục mới
     */
    @Post()
    async createCategory(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.createCategory(dto);
    }

    /**
     * API 28/37: PUT /admin/categories/:id [MVP]
     * Cập nhật danh mục
     */
    @Put(':id')
    async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.updateCategory(id, dto);
    }

    /**
     * API 29/37: DELETE /admin/categories/:id [MVP]
     * Xóa danh mục
     */
    @Delete(':id')
    async removeCategory(@Param('id') id: string) {
        return this.categoriesService.removeCategory(id);
    }
}
