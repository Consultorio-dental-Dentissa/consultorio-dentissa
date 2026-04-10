import { Controller, UseGuards, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { PacientesService } from './pacientes.service';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';

@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('pacientes')
export class PacientesController {

    constructor(private pacientesService: PacientesService) {}

    @Get()
    async get() {
        return await this.pacientesService.obtenerPacientes();
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.pacientesService.obtenerPacientePorId(id);
    }

}
