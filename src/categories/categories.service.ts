import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    /**
     * Lấy tất cả categories, sắp xếp theo tên
     * Bao gồm số lượng products trong mỗi category
     */
    async findAll(): Promise<any[]> {
        const categories = await this.categoryRepository
            .createQueryBuilder('category')
            .leftJoin('category.products', 'product')
            .select([
                'category.id',
                'category.name',
                'category.description',
                'category.image',
                'category.createdAt',
                'category.updatedAt',
            ])
            .addSelect('COUNT(product.id)', 'productCount')
            .groupBy('category.id')
            .orderBy('category.name', 'ASC')
            .getRawAndEntities();

        // Merge entity data with productCount
        return categories.entities.map((category, index) => ({
            ...category,
            productCount: parseInt(categories.raw[index].productCount) || 0,
        }));
    }

    /**
     * Tìm category theo ID
     */
    async findOne(id: string): Promise<Category | null> {
        return this.categoryRepository.findOne({ where: { id } });
    }
}
