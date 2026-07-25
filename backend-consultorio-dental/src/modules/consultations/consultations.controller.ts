import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';

@UseGuards(AuthGuard, IsActiveUserGuard)
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
