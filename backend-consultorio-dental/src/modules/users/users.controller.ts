import {
  Controller,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Get, Post, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from './enums/rol.enum';

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async get(@Query() filters: GetUsersDto) {
    return await this.userService.getAllUsers(filters);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserById(id);
  }

  @Post()
  async post(
    @Body() createUserDto: CreateUserDto,
    @Req() request: AuthRequest,
  ) {
    return await this.userService.createUser(createUserDto, request.user?.id);
  }

  @Patch('status/:id')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusDto,
    @Req() request: AuthRequest,
  ) {
    return await this.userService.updateUserStatus(
      id,
      body.estado,
      request.user?.id,
    );
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() request: AuthRequest,
  ) {
    if (!request.user) throw new UnauthorizedException('No autenticado');
    return await this.userService.updateUser(id, dto, request.user.id);
  }
}
