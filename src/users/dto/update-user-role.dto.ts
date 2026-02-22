import { IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
    @IsNotEmpty({ message: 'Role không được để trống' })
    @IsEnum(['customer', 'admin'], {
        message: 'Role phải là: customer, admin',
    })
    role: string;
}
