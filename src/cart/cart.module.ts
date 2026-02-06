import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from './entities';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Cart, CartItem])],
    controllers: [CartController],
    providers: [CartService],
    exports: [TypeOrmModule, CartService],
})
export class CartModule { }
