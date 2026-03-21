import { Controller, Get, UseGuards, Post, Body, Delete, ParseIntPipe, Param } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { AuthGuard } from '../security/guards/auth.guard';
import { type CrearServicioDto } from './dto/CrearServicioDto';

//@UseGuards(AuthGuard)
@Controller('servicios')
export class ServiciosController {

    constructor(private serviciosService: ServiciosService) {}

    @Get()
    async obtenerServicios() {
        return this.serviciosService.obtenerTodos();
    }

    @Post()
    async crearServicio(@Body () crearServicioDto: CrearServicioDto) {
        return this.serviciosService.crearServicio(crearServicioDto);
    }

}
