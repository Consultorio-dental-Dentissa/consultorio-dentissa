import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Public } from '../../infrastructure/security/decorators/public.decorator';
import { Role } from '../users/enums/rol.enum';
import { FaqService } from './faq.service';
import {
  CreateFaqDto,
  GetFaqDto,
  UpdateFaqDto,
  UpdateFaqStatusDto,
} from './dto/faq.dto';

function requireUserId(request: AuthRequest) {
  if (!request.user) throw new UnauthorizedException('No autenticado');
  return request.user.id;
}

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('faq')
export class FaqController {
  constructor(private faqService: FaqService) {}

  /** Publico: solo preguntas activas. */
  @Public()
  @Get()
  async getPublic(@Query() filters: GetFaqDto) {
    return await this.faqService.getPublic(filters);
  }

  @Get('admin')
  async getAdmin(@Query() filters: GetFaqDto) {
    return await this.faqService.getAdmin(filters);
  }

  @Get('admin/:id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.faqService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateFaqDto, @Req() request: AuthRequest) {
    return await this.faqService.create(dto, requireUserId(request));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFaqDto,
    @Req() request: AuthRequest,
  ) {
    return await this.faqService.update(id, dto, requireUserId(request));
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFaqStatusDto,
    @Req() request: AuthRequest,
  ) {
    return await this.faqService.updateStatus(
      id,
      dto.status,
      requireUserId(request),
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return await this.faqService.remove(id, requireUserId(request));
  }
}
