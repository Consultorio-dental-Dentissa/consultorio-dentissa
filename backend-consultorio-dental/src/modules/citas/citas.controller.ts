import { Controller, Get, Post, Body, ParseIntPipe, Param, UseGuards } from '@nestjs/common';
import { CitasService } from './citas.service';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import type { CrearCitaDto } from './dto/CrearCitaDto';

@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('citas')
export class CitasController {

    constructor(private citasService: CitasService) { }

    @Get()
    async obtenerCitas() {
        return await this.citasService.obtenerCitas();
    }

    @Get(':id')
    async obtenerCita(@Param('id', ParseIntPipe) id: number) {
        return await this.citasService.obtenerCitaPorId(id);
    }

    @Post()
    async crearCita(@Body() crearCitaDto: CrearCitaDto) {
        return await this.citasService.crearCita(crearCitaDto);
    }

}
