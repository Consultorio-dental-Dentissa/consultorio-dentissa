import { Controller, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '../security/guards/auth.guard';
import { PacientesService } from './pacientes.service';

//@UseGuards(AuthGuard)
@Controller('pacientes')
export class PacientesController {

    constructor(private pacientesService: PacientesService) {}

    @Get()
    async get() {
        return await this.pacientesService.obtenerPacientes();
    }


}
