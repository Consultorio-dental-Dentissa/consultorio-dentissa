import { Controller, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Get, Post, Patch,  Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from './enums/rol.enum';

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles([Role.ADMINISTRADOR, Role.ASISTENTE])
@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Get()
    async get() {
        return await this.userService.getAllUsers();
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {        
        return await this.userService.getUserById(id);
    }

    @Post()
    async post(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }

    @Patch('status/:id')
    async updateUserStatus(@Param ('id', ParseIntPipe) id: number, @Body () body: { estado: boolean }) {
        return await this.userService.updateUserStatus(id, body.estado);
    }

}
