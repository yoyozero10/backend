import { IsNotEmpty, IsString, IsOptional, IsObject, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class ShippingAddressDto {
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    @IsString()
    fullName: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsString()
    phone: string;

    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    ward?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsNotEmpty({ message: 'Thành phố không được để trống' })
    @IsString()
    city: string;
}

export class CreateOrderDto {
    @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
    @IsObject()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress: ShippingAddressDto;

    @IsOptional()
    @IsIn(['COD', 'MOCK'], { message: 'Phương thức thanh toán phải là COD hoặc MOCK' })
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    note?: string;
}
