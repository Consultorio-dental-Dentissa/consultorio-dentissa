import { Controller, UseGuards, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../security/guards/auth.guard';
import { PacientesService } from './pacientes.service';

@UseGuards(AuthGuard)
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
