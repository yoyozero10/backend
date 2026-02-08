import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
    @IsNotEmpty({ message: 'Product ID không được để trống' })
    @IsString()
    productId: string;

    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber()
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;
}
