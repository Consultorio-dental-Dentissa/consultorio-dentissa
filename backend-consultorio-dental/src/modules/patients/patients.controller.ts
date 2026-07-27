import { Controller, UseGuards, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { PatientsService } from './patients.service';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from 'src/infrastructure/security/guards/roles.guard';
import { Roles } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';
import { GetPatientsDto } from './dto/get-patient.dto';

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles([Role.ADMINISTRADOR, Role.ASISTENTE])
@Controller('patients')
export class PacientesController {

    constructor(private patientsService: PatientsService) {}

    @Get()
    async get(@Query() filters: GetPatientsDto) {
        return await this.patientsService.getAllPatients(filters);
    }

    @Get('count')
    async getCount(@Query() filters: GetPatientsDto) {
        return await this.patientsService.getPatientsCount(filters);
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.patientsService.getPatientById(id);
    }

}
