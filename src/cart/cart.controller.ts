import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    /**
     * API 13/37: GET /cart [MVP]
     * Lấy giỏ hàng của user hiện tại
     * Protected: Yêu cầu đăng nhập
     */
    @Get()
    async getCart(@Request() req) {
        return this.cartService.getCart(req.user.id);
    }
}
