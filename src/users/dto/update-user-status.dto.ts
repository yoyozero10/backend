import { IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateUserStatusDto {
    @IsNotEmpty({ message: 'Status không được để trống' })
    @IsEnum(['active', 'inactive'], {
        message: 'Status phải là: active, inactive',
    })
    status: string;
}
