import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Token không được để trống' })
    token: string;

    @IsString()
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    newPassword: string;
}
