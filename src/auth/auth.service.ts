import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ message: string; user: Partial<User> }> {
        // Check if email exists
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException({
                statusCode: 400,
                errorCode: 'AUTH_EMAIL_EXISTS',
                message: 'Email đã được sử dụng',
            });
        }

        // Hash password with bcrypt (salt rounds: 10)
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create user
        const user = await this.usersService.create({
            email: registerDto.email,
            password: hashedPassword,
            fullName: registerDto.fullName,
            phone: registerDto.phone,
        });

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return {
            message: 'Đăng ký thành công',
            user: userWithoutPassword,
        };
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
        // Find user by email
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException({
                statusCode: 401,
                errorCode: 'AUTH_INVALID_CREDENTIALS',
                message: 'Email hoặc mật khẩu không chính xác',
            });
        }

        // Check if account is locked
        if (user.status === 'inactive') {
            throw new ForbiddenException({
                statusCode: 403,
                errorCode: 'AUTH_ACCOUNT_LOCKED',
                message: 'Tài khoản đã bị khóa',
            });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException({
                statusCode: 401,
                errorCode: 'AUTH_INVALID_CREDENTIALS',
                message: 'Email hoặc mật khẩu không chính xác',
            });
        }

        // Generate JWT token
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        // Return token and user without password
        const { password, ...userWithoutPassword } = user;
        return {
            accessToken,
            user: userWithoutPassword,
        };
    }
}
