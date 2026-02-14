import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddProductImageDto {
    @IsNotEmpty({ message: 'URL ảnh không được để trống' })
    @IsString()
    imageUrl: string;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    displayOrder?: number;
}
