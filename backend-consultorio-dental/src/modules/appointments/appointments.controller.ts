import { Controller, Get, Post, Put, Body, ParseIntPipe, Param, UseGuards, Query, Req } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from 'src/infrastructure/security/guards/roles.guard';
import { Roles } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

const STAFF_ROLES = [Role.ADMINISTRADOR, Role.ASISTENTE];

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {

    constructor(private appointmentsServices: AppointmentsService) { }

    @Roles(STAFF_ROLES)
    @Get()
    async getAllAppointments(@Query() parameters: GetAppointmentsDto) {
        return await this.appointmentsServices.getAllAppointments(parameters);
    }

    @Roles(STAFF_ROLES)
    @Get('count')
    async getAppointmentsCount(@Query() parameters: GetAppointmentsDto) {
        return await this.appointmentsServices.getAppointmentsCount(parameters);
    }

    /**
     * INDICACIÓN:
     * Sin @Roles(): accesible para cualquier usuario autenticado, ya que
     * siempre devuelve únicamente las citas del paciente que hace la
     * petición (resuelto por su propio id, no por parámetro).
     */
    @Get('me')
    async getMyAppointments(@Req() request) {
        return await this.appointmentsServices.getMyAppointments(request.user.id);
    }

    @Roles(STAFF_ROLES)
    @Get(':id')
    async getAppointmentById(@Param('id', ParseIntPipe) id: number) {
        return await this.appointmentsServices.getAppointmentById(id);
    }

    @Roles(STAFF_ROLES)
    @Post()
    async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
        return await this.appointmentsServices.createAppoinment(createAppointmentDto);
    }

    @Roles(STAFF_ROLES)
    @Put(':id')
    async updateAppointment(
        @Body() updateAppointmentDto: UpdateAppointmentDto,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.appointmentsServices.updateAppointment(id, updateAppointmentDto);
    }

}
