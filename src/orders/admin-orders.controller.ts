import { Controller, Get, Put, Param, Query, Body, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetAdminOrdersDto, UpdateOrderStatusDto } from './dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminOrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * API 33/37: GET /admin/orders/stats [MVP]
     * Thống kê đơn hàng
     * NOTE: Phải đặt TRƯỚC /:id để không bị match nhầm
     */
    @Get('stats')
    async getOrderStats() {
        return this.ordersService.getOrderStats();
    }

    /**
     * API 30/37: GET /admin/orders [MVP]
     * Lấy tất cả đơn hàng (admin)
     */
    @Get()
    async getAllOrders(@Query() query: GetAdminOrdersDto) {
        return this.ordersService.getAllOrders(query);
    }

    /**
     * API 31/37: GET /admin/orders/:id [MVP]
     * Lấy chi tiết đơn hàng (admin)
     */
    @Get(':id')
    async getOrderById(@Param('id') orderId: string) {
        return this.ordersService.getAdminOrderById(orderId);
    }

    /**
     * API 32/37: PUT /admin/orders/:id/status [MVP]
     * Cập nhật trạng thái đơn hàng
     */
    @Put(':id/status')
    async updateOrderStatus(
        @Param('id') orderId: string,
        @Body() dto: UpdateOrderStatusDto,
        @Request() req,
    ) {
        return this.ordersService.updateOrderStatus(orderId, req.user.id, dto);
    }
}

