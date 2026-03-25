import { Controller, Get, Post, Body, ParseIntPipe, Param } from '@nestjs/common';
import { CitasService } from './citas.service';
import type { CrearCitaDto } from './dto/CrearCitaDto';

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
