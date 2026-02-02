import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async update(id: string, userData: Partial<User>): Promise<User | null> {
        await this.usersRepository.update(id, userData);
        return this.findById(id);
    }

    async findByPasswordResetToken(token: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { passwordResetToken: token } });
    }

    /**
     * Đổi mật khẩu user
     * @param userId - ID của user
     * @param oldPassword - Mật khẩu cũ (plain text)
     * @param newPassword - Mật khẩu mới (plain text)
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        // 1. Tìm user theo ID
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException({
                statusCode: 400,
                errorCode: 'USER_NOT_FOUND',
                message: 'Không tìm thấy người dùng',
            });
        }

        // 2. Validate old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException({
                statusCode: 400,
                errorCode: 'USER_INVALID_PASSWORD',
                message: 'Mật khẩu cũ không chính xác',
            });
        }

        // 3. Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 4. Update password in DB
        await this.usersRepository.update(userId, { password: hashedPassword });
    }
}
