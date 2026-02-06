import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './entities';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,
    ) { }

    /**
     * API 13/37: GET /cart [MVP]
     * Lấy giỏ hàng của user, tạo mới nếu chưa có
     */
    async getCart(userId: string): Promise<any> {
        // Tìm hoặc tạo cart cho user
        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['items', 'items.product', 'items.product.images', 'items.product.category'],
        });

        if (!cart) {
            // Tạo cart mới cho user
            cart = this.cartRepository.create({
                user: { id: userId } as User,
                items: [],
            });
            cart = await this.cartRepository.save(cart);
        }

        // Tính toán các giá trị
        const items = cart.items?.map(item => {
            const product = item.product;
            const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl
                || product.images?.[0]?.imageUrl
                || null;
            const subtotal = Number(product.price) * item.quantity;

            return {
                id: item.id,
                quantity: item.quantity,
                product: {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    stock: product.stock,
                    status: product.status,
                    primaryImage,
                    category: product.category ? {
                        id: product.category.id,
                        name: product.category.name,
                    } : null,
                },
                subtotal,
            };
        }) || [];

        // Tính tổng
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

        return {
            id: cart.id,
            items,
            totalItems,
            totalAmount,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }

    /**
     * Helper: Tìm cart theo userId
     */
    async findCartByUserId(userId: string): Promise<Cart | null> {
        return this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
        });
    }

    /**
     * Helper: Tìm hoặc tạo cart
     */
    async getOrCreateCart(userId: string): Promise<Cart> {
        let cart = await this.findCartByUserId(userId);

        if (!cart) {
            cart = this.cartRepository.create({
                user: { id: userId } as User,
                items: [],
            });
            cart = await this.cartRepository.save(cart);
        }

        return cart;
    }
}
