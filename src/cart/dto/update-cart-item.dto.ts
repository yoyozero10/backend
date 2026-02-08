import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber()
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;
}
