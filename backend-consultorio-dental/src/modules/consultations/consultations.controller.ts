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
  Res,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';
import {
  IMAGE_UPLOAD_OPTIONS,
  UploadErrorInterceptor,
} from '../../infrastructure/storage/image-upload.interceptor';
import { MAX_IMAGES_PER_ENTITY } from '../../infrastructure/storage/image-validation';
import type { UploadedImageFile } from '../../infrastructure/storage/image-validation';
import { ConsultationsService } from './consultations.service';
import {
  CreateConsultationDto,
  GetConsultationsDto,
  UpdateConsultationDto,
} from './dto/consultation.dto';

function requireUserId(request: AuthRequest) {
  if (!request.user) throw new UnauthorizedException('No autenticado');
  return request.user.id;
}

/**
 * Datos clinicos: SOLO ADMINISTRADOR (spec 01). Ni el ASISTENTE ni el
 * PACIENTE tienen acceso a consultas ni a sus imagenes.
 */
@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('consultations')
export class ConsultationsController {
  constructor(private consultationsService: ConsultationsService) {}

  @Get()
  async getAll(@Query() filters: GetConsultationsDto) {
    return await this.consultationsService.getAll(filters);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.consultationsService.getById(id);
  }

  @Post()
  async create(
    @Body() dto: CreateConsultationDto,
    @Req() request: AuthRequest,
  ) {
    return await this.consultationsService.create(dto, requireUserId(request));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConsultationDto,
    @Req() request: AuthRequest,
  ) {
    return await this.consultationsService.update(
      id,
      dto,
      requireUserId(request),
    );
  }

  /** multipart/form-data, campo `images` (1 a 5 archivos; total por consulta <= 5). */
  @Post(':id/images')
  @UseInterceptors(
    UploadErrorInterceptor,
    FilesInterceptor('images', MAX_IMAGES_PER_ENTITY, IMAGE_UPLOAD_OPTIONS),
  )
  async addImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: UploadedImageFile[] | undefined,
    @Req() request: AuthRequest,
  ) {
    return await this.consultationsService.addImages(
      id,
      files,
      requireUserId(request),
    );
  }

  @Get(':id/images/:imageId')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.consultationsService.serveImage(id, imageId, res);
  }

  @Delete(':id/images/:imageId')
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Req() request: AuthRequest,
  ) {
    return await this.consultationsService.deleteImage(
      id,
      imageId,
      requireUserId(request),
    );
  }
}
