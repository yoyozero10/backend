import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProductDto, UpdateProductDto, AddProductImageDto } from './dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminProductsController {
    constructor(private readonly productsService: ProductsService) { }

    /**
     * API 22/37: POST /admin/products [MVP]
     * Tạo sản phẩm mới
     */
    @Post()
    async createProduct(@Body() dto: CreateProductDto) {
        return this.productsService.createProduct(dto);
    }

    /**
     * API 23/37: PUT /admin/products/:id [MVP]
     * Cập nhật sản phẩm
     */
    @Put(':id')
    async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.updateProduct(id, dto);
    }

    /**
     * API 24/37: DELETE /admin/products/:id [MVP]
     * Xóa sản phẩm
     */
    @Delete(':id')
    async removeProduct(@Param('id') id: string) {
        return this.productsService.removeProduct(id);
    }

    /**
     * API 25/37: POST /admin/products/:id/images [Optional]
     * Thêm ảnh cho sản phẩm
     */
    @Post(':id/images')
    async addProductImage(@Param('id') id: string, @Body() dto: AddProductImageDto) {
        return this.productsService.addProductImage(id, dto);
    }

    /**
     * API 26/37: DELETE /admin/products/:id/images/:imageId [Optional]
     * Xóa ảnh sản phẩm
     */
    @Delete(':id/images/:imageId')
    async removeProductImage(@Param('id') id: string, @Param('imageId') imageId: string) {
        return this.productsService.removeProductImage(id, imageId);
    }
}
