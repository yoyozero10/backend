import { Controller, Get, Put, Param, Query, Body, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetAdminUsersDto, UpdateUserStatusDto, UpdateUserRoleDto } from './dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * API 34/37: GET /admin/users [MVP]
     */
    @Get()
    async getAllUsers(@Query() query: GetAdminUsersDto) {
        return this.usersService.getAllUsers(query);
    }

    /**
     * API 35/37: GET /admin/users/:id [MVP]
     */
    @Get(':id')
    async getUserById(@Param('id') userId: string) {
        return this.usersService.getAdminUserById(userId);
    }

    /**
     * API 36/37: PUT /admin/users/:id/status [MVP]
     */
    @Put(':id/status')
    async updateUserStatus(
        @Param('id') userId: string,
        @Body() dto: UpdateUserStatusDto,
        @Request() req,
    ) {
        return this.usersService.updateUserStatus(userId, req.user.id, dto);
    }

    /**
     * API 37/37: PUT /admin/users/:id/role [MVP]
     */
    @Put(':id/role')
    async updateUserRole(
        @Param('id') userId: string,
        @Body() dto: UpdateUserRoleDto,
        @Request() req,
    ) {
        return this.usersService.updateUserRole(userId, req.user.id, dto);
    }
}
