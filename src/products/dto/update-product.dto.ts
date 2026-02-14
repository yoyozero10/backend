import { IsOptional, IsString, IsNumber, IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Giá phải là số' })
    @Min(0, { message: 'Giá không được âm' })
    price?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
    @Min(0, { message: 'Số lượng tồn kho không được âm' })
    stock?: number;

    @IsOptional()
    @IsUUID('4', { message: 'categoryId phải là UUID hợp lệ' })
    categoryId?: string;

    @IsOptional()
    @IsEnum(['active', 'inactive'], { message: 'Status phải là active hoặc inactive' })
    status?: string;
}
