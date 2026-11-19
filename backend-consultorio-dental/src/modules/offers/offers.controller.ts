import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  IMAGE_UPLOAD_OPTIONS,
  UploadErrorInterceptor,
} from '../../infrastructure/storage/image-upload.interceptor';
import type { UploadedImageFile } from '../../infrastructure/storage/image-validation';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Public } from '../../infrastructure/security/decorators/public.decorator';
import { Role } from '../users/enums/rol.enum';
import { OffersService } from './offers.service';
import {
  CreateOfferDto,
  GetOffersDto,
  UpdateOfferDto,
  UpdateOfferStatusDto,
} from './dto/offer.dto';

function requireUserId(request: AuthRequest) {
  if (!request.user) throw new UnauthorizedException('No autenticado');
  return request.user.id;
}

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  /** Publico: solo ofertas activas y vigentes. */
  @Public()
  @Get()
  async getPublic(@Query() filters: GetOffersDto) {
    return await this.offersService.getPublic(filters);
  }

  @Get('admin')
  async getAdmin(@Query() filters: GetOffersDto) {
    return await this.offersService.getAdmin(filters);
  }

  @Get('admin/:id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.offersService.getById(id);
  }

  /** Vista previa de la imagen (ADMIN), incluso de ofertas inactivas o vencidas. */
  @Get('admin/:id/image')
  async getAdminImage(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.offersService.serveImage(id, true, res);
  }

  /** Publico: solo la imagen de ofertas activas y vigentes, con content-type fijo. */
  @Public()
  @Get(':id/image')
  async getPublicImage(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.offersService.serveImage(id, false, res);
  }

  /** multipart/form-data, campo "image": sube o reemplaza la imagen. */
  @Put(':id/image')
  @UseInterceptors(
    UploadErrorInterceptor,
    FileInterceptor('image', IMAGE_UPLOAD_OPTIONS),
  )
  async setImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedImageFile | undefined,
    @Req() request: AuthRequest,
  ) {
    return await this.offersService.setImage(id, file, requireUserId(request));
  }

  @Delete(':id/image')
  async removeImage(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return await this.offersService.removeImage(id, requireUserId(request));
  }

  @Post()
  async create(@Body() dto: CreateOfferDto, @Req() request: AuthRequest) {
    return await this.offersService.create(dto, requireUserId(request));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferDto,
    @Req() request: AuthRequest,
  ) {
    return await this.offersService.update(id, dto, requireUserId(request));
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferStatusDto,
    @Req() request: AuthRequest,
  ) {
    return await this.offersService.updateStatus(
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
    return await this.offersService.remove(id, requireUserId(request));
  }
}
