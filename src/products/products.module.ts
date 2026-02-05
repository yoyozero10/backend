import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Product, ProductImage])],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule { }
