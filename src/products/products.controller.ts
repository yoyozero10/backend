import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    /**
     * API 11/37: GET /products [MVP]
     * Lấy danh sách sản phẩm với pagination, search, filter, sort
     * 
     * Query params:
     * - page: số trang (default: 1)
     * - limit: số item mỗi trang (default: 10)
     * - search: tìm theo tên/mô tả
     * - categoryId: lọc theo danh mục
     * - minPrice, maxPrice: lọc theo giá
     * - sortBy: price_asc, price_desc, newest, name_asc
     */
    @Get()
    async findAll(@Query() query: GetProductsDto) {
        return this.productsService.findAll(query);
    }

    /**
     * API 12/37: GET /products/:id [MVP]
     * Lấy chi tiết sản phẩm với tất cả images
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }
}
