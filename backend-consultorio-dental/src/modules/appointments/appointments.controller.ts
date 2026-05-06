import { Controller, Get, Post, Body, ParseIntPipe, Param, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('appointments')
export class AppointmentsController {

    constructor(private appointmentsServices: AppointmentsService) { }

    @Get()
    async getAllAppointments() {
        return await this.appointmentsServices.getAllAppointments();
    }

    @Get(':id')
    async getAppointmentById(@Param('id', ParseIntPipe) id: number) {
        return await this.appointmentsServices.getAppointmentById(id);
    }

    @Post()
    async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
        return await this.appointmentsServices.createAppoinment(createAppointmentDto);
    }

}
