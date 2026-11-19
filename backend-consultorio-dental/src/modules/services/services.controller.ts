import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  ParseIntPipe,
  Param,
  Patch,
  Query,
  Req,
  Res,
  Delete,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  IMAGE_UPLOAD_OPTIONS,
  UploadErrorInterceptor,
} from '../../infrastructure/storage/image-upload.interceptor';
import { MAX_IMAGES_PER_ENTITY } from '../../infrastructure/storage/image-validation';
import type { UploadedImageFile } from '../../infrastructure/storage/image-validation';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { ServicesService } from './services.service';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServicesDto } from './dto/get-services.dto';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { Public } from 'src/infrastructure/security/decorators/public.decorator';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Controller('services')
export class ServiciosController {
  constructor(private servicesService: ServicesService) {}

  @Public()
  @Get()
  async get(@Query() filters: GetServicesDto, @Req() request: AuthRequest) {
    return await this.servicesService.getAllServices(filters, request.user);
  }

  @Roles(Role.ADMINISTRADOR)
  @Patch('status/:id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateServiceStatusDto,
    @Req() request: AuthRequest,
  ) {
    return await this.servicesService.updateServiceStatus(
      id,
      body.status,
      request.user?.id,
    );
  }

  @Roles(Role.ADMINISTRADOR)
  @Patch(':id')
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
    @Req() request: AuthRequest,
  ) {
    return await this.servicesService.updateService(
      id,
      dto,
      requireUserId(request),
    );
  }

  @Roles(Role.ADMINISTRADOR)
  @Post()
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @Req() request: AuthRequest,
  ) {
    return await this.servicesService.createService(
      createServiceDto,
      request.user?.id,
    );
  }

  /** multipart/form-data, campo "images" (1 a 5 archivos; total por servicio max 5). */
  @Roles(Role.ADMINISTRADOR)
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
    return await this.servicesService.addImages(
      id,
      files,
      requireUserId(request),
    );
  }

  /** Reemplaza el archivo de una imagen (campo "image"). */
  @Roles(Role.ADMINISTRADOR)
  @Put(':id/images/:imageId')
  @UseInterceptors(
    UploadErrorInterceptor,
    FileInterceptor('image', IMAGE_UPLOAD_OPTIONS),
  )
  async replaceImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @UploadedFile() file: UploadedImageFile | undefined,
    @Req() request: AuthRequest,
  ) {
    return await this.servicesService.replaceImage(
      id,
      imageId,
      file,
      requireUserId(request),
    );
  }

  @Roles(Role.ADMINISTRADOR)
  @Delete(':id/images/:imageId')
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Req() request: AuthRequest,
  ) {
    return await this.servicesService.deleteImage(
      id,
      imageId,
      requireUserId(request),
    );
  }

  /** Publico (servicios activos): el contenido se sirve con content-type fijo. */
  @Public()
  @Get(':id/images/:imageId')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.servicesService.serveImage(
      id,
      imageId,
      request.user,
      res,
    );
  }
}

function requireUserId(request: AuthRequest) {
  if (!request.user) throw new UnauthorizedException('No autenticado');
  return request.user.id;
}
