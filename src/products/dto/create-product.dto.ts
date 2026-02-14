import { IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    @IsString()
    description: string;

    @Type(() => Number)
    @IsNumber({}, { message: 'Giá phải là số' })
    @Min(0, { message: 'Giá không được âm' })
    price: number;

    @Type(() => Number)
    @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
    @Min(0, { message: 'Số lượng tồn kho không được âm' })
    stock: number;

    @IsNotEmpty({ message: 'Danh mục không được để trống' })
    @IsUUID('4', { message: 'categoryId phải là UUID hợp lệ' })
    categoryId: string;

    @IsOptional()
    @IsEnum(['active', 'inactive'], { message: 'Status phải là active hoặc inactive' })
    status?: string;
}
