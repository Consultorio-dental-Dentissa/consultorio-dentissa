import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from 'src/infrastructure/security/guards/roles.guard';
import { Roles } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles([Role.ADMINISTRADOR, Role.ASISTENTE])
@Controller('consultations')
export class ConsultationsController {

    constructor(private consultationsService: ConsultationsService) { }

    @Get()
    async getAllConsultations() {
        return await this.consultationsService.getAllConsultations();
    }

    @Post()
    async createConsultation(@Body() createConsultationDto: CreateConsultationDto) {
        return await this.consultationsService.createConsultation(createConsultationDto);
    }

    @Put(':id')
    async updateConsultation(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateConsultationDto: UpdateConsultationDto
    ) {
        return await this.consultationsService.updateConsultation(id, updateConsultationDto);
    }
}
