import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Body,
  UnauthorizedException,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { PatientsService } from './patients.service';
import { GetPatientsDto } from './dto/get-patients.dto';
import {
  AdminUpdatePatientDto,
  GetPatientHistoryDto,
  UpdateMyProfileDto,
} from './dto/update-patient.dto';
import { UserThrottlerGuard } from 'src/infrastructure/security/guards/user-throttler.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

const ONE_MINUTE_MS = 60 * 1000;

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Controller('patients')
export class PacientesController {
  constructor(private patientsService: PatientsService) {}

  @Roles(Role.ADMINISTRADOR, Role.ASISTENTE)
  @Get()
  async get(@Query() filters: GetPatientsDto, @Req() request: AuthRequest) {
    return await this.patientsService.getAllPatients(
      filters,
      requireUser(request),
    );
  }

  /** Perfil propio (el patientId sale del usuario autenticado). */
  @Roles(Role.PACIENTE)
  @Get('me')
  async getMe(@Req() request: AuthRequest) {
    return await this.patientsService.getMyProfile(requireUser(request));
  }

  /** El paciente modifica solo email, telefono y telefono de emergencia. */
  @Roles(Role.PACIENTE)
  @UseGuards(UserThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: ONE_MINUTE_MS } })
  @Patch('me')
  async updateMe(@Body() dto: UpdateMyProfileDto, @Req() request: AuthRequest) {
    return await this.patientsService.updateMyProfile(
      dto,
      requireUser(request),
    );
  }

  @Roles(Role.ADMINISTRADOR)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdatePatientDto,
    @Req() request: AuthRequest,
  ) {
    return await this.patientsService.updatePatient(
      id,
      dto,
      requireUser(request).id,
    );
  }

  /** Citas (todos los roles con acceso) o consultas (solo ADMIN). */
  @Roles(Role.ADMINISTRADOR, Role.ASISTENTE, Role.PACIENTE)
  @Get(':id/history')
  async getHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query() filters: GetPatientHistoryDto,
    @Req() request: AuthRequest,
  ) {
    return await this.patientsService.getHistory(
      id,
      filters,
      requireUser(request),
    );
  }

  @Roles(Role.ADMINISTRADOR, Role.ASISTENTE, Role.PACIENTE)
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return await this.patientsService.getPatientById(id, request.user);
  }
}

function requireUser(request: AuthRequest) {
  if (!request.user) throw new UnauthorizedException('No autenticado');
  return { id: request.user.id, role: request.user.role };
}
