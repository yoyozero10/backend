import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
    @IsString()
    oldPassword: string;

    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    @MaxLength(50, { message: 'Mật khẩu mới không được vượt quá 50 ký tự' })
    newPassword: string;

    @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
    @IsString()
    confirmPassword: string;
}
