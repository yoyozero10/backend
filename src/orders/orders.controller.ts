import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto, GetOrdersDto } from './dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * API 18/37: POST /orders [MVP]
     * Tạo đơn hàng từ giỏ hàng
     */
    @Post()
    async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.id, dto);
    }

    /**
     * API 19/37: GET /orders [MVP]
     * Lấy danh sách đơn hàng của user
     */
    @Get()
    async getMyOrders(@Request() req, @Query() query: GetOrdersDto) {
        return this.ordersService.getMyOrders(req.user.id, query);
    }

    /**
     * API 20/37: GET /orders/:id [MVP]
     * Lấy chi tiết đơn hàng
     */
    @Get(':id')
    async getOrderById(@Request() req, @Param('id') orderId: string) {
        return this.ordersService.getOrderById(req.user.id, orderId);
    }

    /**
     * API 21/37: PUT /orders/:id/cancel [Optional]
     * Hủy đơn hàng
     */
    @Put(':id/cancel')
    async cancelOrder(@Request() req, @Param('id') orderId: string) {
        return this.ordersService.cancelOrder(req.user.id, orderId);
    }
}
