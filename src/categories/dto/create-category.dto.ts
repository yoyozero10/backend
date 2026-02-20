import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;
}
