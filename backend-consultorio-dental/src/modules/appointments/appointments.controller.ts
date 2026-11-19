import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  ParseIntPipe,
  Param,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthRequest } from 'src/infrastructure/security/auth-request';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointment.dto';
import { RolesGuard } from 'src/infrastructure/security/guards/roles.guard';
import { Roles } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

/** Usuario autenticado del request; sin el, 401 (nunca se continua sin usuario). */
function requireUser(request: AuthRequest) {
  if (!request.user) {
    throw new UnauthorizedException('No autenticado');
  }
  return request.user;
}

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.ASISTENTE, Role.PACIENTE)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsServices: AppointmentsService) {}

  @Get()
  async getAllAppointments(
    @Query() parameters: GetAppointmentsDto,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.getAllAppointments(
      parameters,
      requireUser(request),
    );
  }

  @Get(':id')
  async getAppointmentById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.getAppointmentById(
      id,
      requireUser(request),
    );
  }

  @Post()
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.createAppoinment(
      createAppointmentDto,
      requireUser(request),
    );
  }

  /** Edita servicio y notas (la fecha se cambia con :id/reschedule). */
  @Patch(':id')
  async updateAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.updateAppointment(
      id,
      dto,
      requireUser(request),
    );
  }

  @Patch(':id/confirm')
  @Roles(Role.ADMINISTRADOR)
  async confirmAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.confirmAppointment(
      id,
      requireUser(request),
    );
  }

  @Patch(':id/complete')
  @Roles(Role.ADMINISTRADOR)
  async completeAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.completeAppointment(
      id,
      requireUser(request),
    );
  }

  @Patch(':id/cancel')
  async cancelAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelAppointmentDto,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.cancelAppointment(
      id,
      dto,
      requireUser(request),
    );
  }

  @Patch(':id/reschedule')
  async rescheduleAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleAppointmentDto,
    @Req() request: AuthRequest,
  ) {
    return await this.appointmentsServices.rescheduleAppointment(
      id,
      dto,
      requireUser(request),
    );
  }
}
