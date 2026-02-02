import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    Request,
    BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto, ChangePasswordDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * API 7/37: GET /users/me [MVP]
     * Lấy thông tin profile của user đang đăng nhập
     */
    @Get('me')
    async getProfile(@Request() req) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) {
            throw new BadRequestException({
                statusCode: 400,
                errorCode: 'USER_NOT_FOUND',
                message: 'Không tìm thấy người dùng',
            });
        }

        // Exclude password from response
        const { password, refreshToken, passwordResetToken, passwordResetExpires, ...result } = user;
        return result;
    }

    /**
     * API 8/37: PUT /users/me [MVP]
     * Cập nhật profile (fullName, phone, avatar)
     * Không cho phép update: email, role, status
     */
    @Put('me')
    async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
        const updatedUser = await this.usersService.update(req.user.id, updateProfileDto);
        if (!updatedUser) {
            throw new BadRequestException({
                statusCode: 400,
                errorCode: 'USER_NOT_FOUND',
                message: 'Không tìm thấy người dùng',
            });
        }

        // Exclude password from response
        const { password, refreshToken, passwordResetToken, passwordResetExpires, ...result } = updatedUser;
        return result;
    }

    /**
     * API 9/37: PUT /users/me/password [MVP]
     * Đổi mật khẩu
     */
    @Put('me/password')
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        // Validate confirmPassword matches newPassword
        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            throw new BadRequestException({
                statusCode: 400,
                errorCode: 'USER_PASSWORD_MISMATCH',
                message: 'Mật khẩu xác nhận không khớp',
            });
        }

        await this.usersService.changePassword(
            req.user.id,
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword,
        );

        return { message: 'Đổi mật khẩu thành công' };
    }
}
