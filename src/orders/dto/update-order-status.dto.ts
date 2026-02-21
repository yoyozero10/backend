import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    @IsEnum(['pending', 'processing', 'shipping', 'completed', 'cancelled'], {
        message: 'Status phải là: pending, processing, shipping, completed, cancelled',
    })
    status: string;

    @IsOptional()
    @IsString()
    note?: string;
}
