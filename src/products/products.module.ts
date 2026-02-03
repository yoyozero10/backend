import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product, ProductImage])],
    controllers: [],
    providers: [],
    exports: [TypeOrmModule],
})
export class ProductsModule { }
