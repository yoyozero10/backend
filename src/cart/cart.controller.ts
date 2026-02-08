import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    /**
     * API 13/37: GET /cart [MVP]
     * Lấy giỏ hàng của user hiện tại
     */
    @Get()
    async getCart(@Request() req) {
        return this.cartService.getCart(req.user.id);
    }

    /**
     * API 14/37: POST /cart/items [MVP]
     * Thêm sản phẩm vào giỏ hàng
     */
    @Post('items')
    async addToCart(@Request() req, @Body() dto: AddToCartDto) {
        return this.cartService.addToCart(req.user.id, dto);
    }

    /**
     * API 15/37: PUT /cart/items/:id [MVP]
     * Cập nhật số lượng cart item
     */
    @Put('items/:id')
    async updateCartItem(
        @Request() req,
        @Param('id') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateCartItem(req.user.id, itemId, dto);
    }

    /**
     * API 16/37: DELETE /cart/items/:id [MVP]
     * Xóa một sản phẩm khỏi giỏ hàng
     */
    @Delete('items/:id')
    async removeCartItem(@Request() req, @Param('id') itemId: string) {
        return this.cartService.removeCartItem(req.user.id, itemId);
    }

    /**
     * API 17/37: DELETE /cart [MVP]
     * Xóa toàn bộ giỏ hàng
     */
    @Delete()
    async clearCart(@Request() req) {
        return this.cartService.clearCart(req.user.id);
    }
}
