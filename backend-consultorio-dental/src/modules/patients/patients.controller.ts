import { Controller, UseGuards, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { PatientsService } from './patients.service';
import { GetPatientsDto } from './dto/get-patients.dto';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';

@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('patients')
export class PacientesController {

    constructor(private patientsService: PatientsService) {}

    @Get()
    async get(@Query() filters: GetPatientsDto) {
        return await this.patientsService.getAllPatients(filters);
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.patientsService.getPatientById(id);
    }

}
