import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOrdersDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;

    @IsOptional()
    @IsEnum(['pending', 'processing', 'shipping', 'completed', 'cancelled'], {
        message: 'orderStatus phải là: pending, processing, shipping, completed, cancelled',
    })
    orderStatus?: string;
}
