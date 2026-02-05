import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { GetProductsDto, ProductSortBy } from './dto';

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductImage)
        private productImageRepository: Repository<ProductImage>,
    ) { }

    /**
     * API 11/37: GET /products [MVP]
     * Lấy danh sách sản phẩm với pagination, search, filter, sort
     */
    async findAll(query: GetProductsDto): Promise<PaginatedResult<any>> {
        const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice, sortBy } = query;

        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoin('product.images', 'image', 'image.isPrimary = :isPrimary', { isPrimary: true })
            .addSelect(['image.id', 'image.imageUrl', 'image.isPrimary'])
            .where('product.status = :status', { status: 'active' });

        // Search by name or description
        if (search) {
            queryBuilder.andWhere(
                '(product.name LIKE :search OR product.description LIKE :search)',
                { search: `%${search}%` },
            );
        }

        // Filter by category
        if (categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId });
        }

        // Filter by price range
        if (minPrice !== undefined) {
            queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
        }
        if (maxPrice !== undefined) {
            queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
        }

        // Sorting
        this.applySorting(queryBuilder, sortBy);

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Execute query
        const products = await queryBuilder.getMany();

        // Format response
        const data = products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            status: product.status,
            category: product.category ? {
                id: product.category.id,
                name: product.category.name,
            } : null,
            primaryImage: product.images?.[0]?.imageUrl || null,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * API 12/37: GET /products/:id [MVP]
     * Lấy chi tiết sản phẩm với tất cả images
     */
    async findOne(id: string): Promise<any> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'images'],
        });

        if (!product) {
            throw new NotFoundException({
                statusCode: 404,
                errorCode: 'PRODUCT_NOT_FOUND',
                message: 'Không tìm thấy sản phẩm',
            });
        }

        // Sort images by displayOrder
        const sortedImages = product.images?.sort((a, b) => a.displayOrder - b.displayOrder) || [];

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            status: product.status,
            category: product.category ? {
                id: product.category.id,
                name: product.category.name,
                description: product.category.description,
            } : null,
            images: sortedImages.map(img => ({
                id: img.id,
                imageUrl: img.imageUrl,
                isPrimary: img.isPrimary,
                displayOrder: img.displayOrder,
            })),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }

    private applySorting(queryBuilder: SelectQueryBuilder<Product>, sortBy?: ProductSortBy): void {
        switch (sortBy) {
            case ProductSortBy.PRICE_ASC:
                queryBuilder.orderBy('product.price', 'ASC');
                break;
            case ProductSortBy.PRICE_DESC:
                queryBuilder.orderBy('product.price', 'DESC');
                break;
            case ProductSortBy.NAME_ASC:
                queryBuilder.orderBy('product.name', 'ASC');
                break;
            case ProductSortBy.NEWEST:
            default:
                queryBuilder.orderBy('product.createdAt', 'DESC');
                break;
        }
    }
}
