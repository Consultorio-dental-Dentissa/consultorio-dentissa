import { Controller, Get, Post, Put, Body, ParseIntPipe, Param, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('appointments')
export class AppointmentsController {

    constructor(private appointmentsServices: AppointmentsService) { }

    @Get()
    async getAllAppointments(@Query() parameters: GetAppointmentsDto) {
        return await this.appointmentsServices.getAllAppointments(parameters);
    }

    @Get('count')
    async getAppointmentsCount(@Query() parameters: GetAppointmentsDto) {
        return await this.appointmentsServices.getAppointmentsCount(parameters);
    }

    @Get(':id')
    async getAppointmentById(@Param('id', ParseIntPipe) id: number) {
        return await this.appointmentsServices.getAppointmentById(id);
    }

    @Post()
    async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
        return await this.appointmentsServices.createAppoinment(createAppointmentDto);
    }

    @Put(':id')
    async updateAppointment(
        @Body() updateAppointmentDto: UpdateAppointmentDto,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.appointmentsServices.updateAppointment(id, updateAppointmentDto);
    }

}
