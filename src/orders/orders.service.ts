import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, OrderStatusHistory } from './entities';
import { Cart } from '../cart/entities';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto, GetOrdersDto } from './dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(OrderStatusHistory)
        private orderStatusHistoryRepository: Repository<OrderStatusHistory>,
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private dataSource: DataSource,
    ) { }

    /**
     * Generate unique order code: ORD-YYYYMMDD-XXXX
     */
    private async generateOrderCode(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

        // Đếm số đơn hàng trong ngày để tạo sequence
        const count = await this.orderRepository
            .createQueryBuilder('order')
            .where('DATE(order.createdAt) = CURDATE()')
            .getCount();

        const sequence = String(count + 1).padStart(4, '0');
        return `ORD-${dateStr}-${sequence}`;
    }

    /**
     * API 18/37: POST /orders [MVP] ⭐
     * Tạo đơn hàng từ giỏ hàng
     * 
     * Flow:
     * 1. Validate cart not empty
     * 2. Start Transaction
     * 3. For each cart item: Check stock with FOR UPDATE lock
     * 4. Generate order code
     * 5. Create order + order items (with snapshots)
     * 6. Update stock (atomic)
     * 7. Create status history
     * 8. Clear cart
     * 9. Commit Transaction
     */
    async createOrder(userId: string, dto: CreateOrderDto): Promise<any> {
        return await this.dataSource.transaction(async manager => {
            // 1. Lấy cart với items
            const cart = await manager.findOne(Cart, {
                where: { user: { id: userId } },
                relations: ['items', 'items.product'],
            });

            // Validate cart not empty
            if (!cart || !cart.items || cart.items.length === 0) {
                throw new BadRequestException({
                    statusCode: 400,
                    errorCode: 'ORDER_CART_EMPTY',
                    message: 'Giỏ hàng trống, không thể đặt hàng',
                });
            }

            // 2. Validate stock với FOR UPDATE lock + tính tổng tiền
            let totalAmount = 0;
            const orderItemsData: {
                product: Product;
                productNameSnapshot: string;
                unitPriceSnapshot: number;
                quantity: number;
                subtotal: number;
            }[] = [];

            for (const cartItem of cart.items) {
                // Check stock with FOR UPDATE lock (pessimistic_write)
                const product = await manager.findOne(Product, {
                    where: { id: cartItem.product.id },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!product) {
                    throw new BadRequestException({
                        statusCode: 400,
                        errorCode: 'ORDER_PRODUCT_NOT_FOUND',
                        message: `Sản phẩm "${cartItem.product.name}" không còn tồn tại`,
                    });
                }

                // If stock < quantity → Rollback
                if (product.stock < cartItem.quantity) {
                    throw new BadRequestException({
                        statusCode: 400,
                        errorCode: 'CART_OUT_OF_STOCK',
                        message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho (yêu cầu ${cartItem.quantity})`,
                    });
                }

                // Tính snapshot values
                const unitPriceSnapshot = Number(product.price);
                const subtotal = unitPriceSnapshot * cartItem.quantity;
                totalAmount += subtotal;

                orderItemsData.push({
                    product,
                    productNameSnapshot: product.name,
                    unitPriceSnapshot,
                    quantity: cartItem.quantity,
                    subtotal,
                });

                // Update stock (atomic): stock = stock - quantity
                await manager
                    .createQueryBuilder()
                    .update(Product)
                    .set({ stock: () => `stock - ${cartItem.quantity}` })
                    .where('id = :id', { id: product.id })
                    .execute();
            }

            // 3. Generate order code
            const orderCode = await this.generateOrderCode();

            // 4. Create order
            const order = manager.create(Order, {
                orderCode,
                user: { id: userId },
                totalAmount,
                shippingAddress: dto.shippingAddress,
                paymentMethod: dto.paymentMethod || 'COD',
                paymentStatus: 'pending',
                orderStatus: 'pending',
            });

            const savedOrder = await manager.save(order);

            // 5. Create order items with snapshots
            for (const itemData of orderItemsData) {
                const orderItem = manager.create(OrderItem, {
                    order: { id: savedOrder.id } as Order,
                    product: { id: itemData.product.id } as Product,
                    productNameSnapshot: itemData.productNameSnapshot,
                    unitPriceSnapshot: itemData.unitPriceSnapshot,
                    quantity: itemData.quantity,
                    subtotal: itemData.subtotal,
                });
                await manager.save(orderItem);
            }

            // 6. Create status history [Optional]
            const statusHistory = manager.create(OrderStatusHistory, {
                order: { id: savedOrder.id } as Order,
                fromStatus: 'pending',
                toStatus: 'pending',
                note: 'Đơn hàng được tạo',
                changedBy: userId,
            });
            await manager.save(statusHistory);

            // 7. Clear cart - xóa tất cả cart items
            await manager.remove(cart.items);

            // 8. Return created order (fetch full data)
            const createdOrder = await manager.findOne(Order, {
                where: { id: savedOrder.id },
                relations: ['items', 'items.product'],
            });

            return this.formatOrderResponse(createdOrder!);
        });
    }

    /**
     * API 19/37: GET /orders [MVP]
     * Lấy danh sách đơn hàng của user hiện tại
     * - Filter by user (current user only)
     * - Pagination
     * - Filter by status (optional)
     * - Order by createdAt DESC
     * - Return summary (no items)
     */
    async getMyOrders(userId: string, query: GetOrdersDto): Promise<any> {
        const { page = 1, limit = 10, orderStatus } = query;

        const qb = this.orderRepository
            .createQueryBuilder('order')
            .where('order.userId = :userId', { userId })
            .orderBy('order.createdAt', 'DESC');

        // Filter by status (optional)
        if (orderStatus) {
            qb.andWhere('order.orderStatus = :orderStatus', { orderStatus });
        }

        // Pagination
        const total = await qb.getCount();
        const orders = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            data: orders.map(order => ({
                id: order.id,
                orderCode: order.orderCode,
                totalAmount: Number(order.totalAmount),
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * API 20/37: GET /orders/:id [MVP]
     * Lấy chi tiết đơn hàng
     * - Validate order belongs to user
     * - Return full order with items
     * - Include status history [Optional]
     */
    async getOrderById(userId: string, orderId: string): Promise<any> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['items', 'items.product', 'user'],
        });

        if (!order) {
            throw new NotFoundException({
                statusCode: 404,
                errorCode: 'ORDER_NOT_FOUND',
                message: 'Không tìm thấy đơn hàng',
            });
        }

        // Validate order belongs to user
        if (order.user.id !== userId) {
            throw new ForbiddenException({
                statusCode: 403,
                errorCode: 'FORBIDDEN_RESOURCE',
                message: 'Bạn không có quyền xem đơn hàng này',
            });
        }

        // Include status history [Optional]
        const statusHistory = await this.orderStatusHistoryRepository.find({
            where: { order: { id: orderId } },
            order: { createdAt: 'ASC' },
        });

        const response = this.formatOrderResponse(order);
        response.statusHistory = statusHistory.map(h => ({
            id: h.id,
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            note: h.note,
            changedBy: h.changedBy,
            createdAt: h.createdAt,
        }));

        return response;
    }

    /**
     * API 21/37: PUT /orders/:id/cancel [Optional]
     * Hủy đơn hàng
     * - Validate order belongs to user
     * - Check status = 'pending'
     * - Transaction: update status + restore stock + status history
     */
    async cancelOrder(userId: string, orderId: string): Promise<any> {
        return await this.dataSource.transaction(async manager => {
            // Lấy order với items
            const order = await manager.findOne(Order, {
                where: { id: orderId },
                relations: ['items', 'items.product', 'user'],
                lock: { mode: 'pessimistic_write' },
            });

            if (!order) {
                throw new NotFoundException({
                    statusCode: 404,
                    errorCode: 'ORDER_NOT_FOUND',
                    message: 'Không tìm thấy đơn hàng',
                });
            }

            // Validate order belongs to user
            if (order.user.id !== userId) {
                throw new ForbiddenException({
                    statusCode: 403,
                    errorCode: 'FORBIDDEN_RESOURCE',
                    message: 'Bạn không có quyền hủy đơn hàng này',
                });
            }

            // Check status = 'pending' only
            if (order.orderStatus !== 'pending') {
                throw new BadRequestException({
                    statusCode: 400,
                    errorCode: 'ORDER_INVALID_TRANSITION',
                    message: `Không thể hủy đơn hàng ở trạng thái "${order.orderStatus}". Chỉ được hủy khi đang "pending"`,
                });
            }

            // Update status to 'cancelled'
            const oldStatus = order.orderStatus;
            order.orderStatus = 'cancelled';
            await manager.save(order);

            // Restore stock (atomic update)
            for (const item of order.items) {
                await manager
                    .createQueryBuilder()
                    .update(Product)
                    .set({ stock: () => `stock + ${item.quantity}` })
                    .where('id = :id', { id: item.product.id })
                    .execute();
            }

            // Create status history
            const statusHistory = manager.create(OrderStatusHistory, {
                order: { id: orderId } as Order,
                fromStatus: oldStatus,
                toStatus: 'cancelled',
                note: 'Người dùng hủy đơn hàng',
                changedBy: userId,
            });
            await manager.save(statusHistory);

            // Return updated order
            const updatedOrder = await manager.findOne(Order, {
                where: { id: orderId },
                relations: ['items', 'items.product'],
            });

            return this.formatOrderResponse(updatedOrder!);
        });
    }

    /**
     * Format order response
     */
    private formatOrderResponse(order: Order): any {
        return {
            id: order.id,
            orderCode: order.orderCode,
            totalAmount: Number(order.totalAmount),
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            items: order.items?.map(item => ({
                id: item.id,
                productNameSnapshot: item.productNameSnapshot,
                unitPriceSnapshot: Number(item.unitPriceSnapshot),
                quantity: item.quantity,
                subtotal: Number(item.subtotal),
                product: item.product ? {
                    id: item.product.id,
                    name: item.product.name,
                } : null,
            })) || [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
}
