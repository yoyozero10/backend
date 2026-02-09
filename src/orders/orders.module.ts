import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem, OrderStatusHistory } from './entities';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory])],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [TypeOrmModule],
})
export class OrdersModule { }
