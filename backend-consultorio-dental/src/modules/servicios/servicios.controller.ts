import { Controller, Get, UseGuards, Post, Body, Delete, ParseIntPipe, Param, Patch } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { AuthGuard } from '../security/guards/auth.guard';
import { type CrearServicioDto } from './dto/CrearServicioDto';

@UseGuards(AuthGuard)
@Controller('servicios')
export class ServiciosController {

    constructor(private serviciosService: ServiciosService) {}

    @Get()
    async obtenerServicios() {
        return await this.serviciosService.obtenerTodos();
    }

    @Patch(':id/estado')
    async cambiarEstadoServicio(@Param ('id', ParseIntPipe) id: number, @Body () body: {estado: boolean}) {
        return await this.serviciosService.cambiarEstadoServicio(id, body.estado);
    }

    @Post()
    async crearServicio(@Body () crearServicioDto: CrearServicioDto) {
        return await this.serviciosService.crearServicio(crearServicioDto);
    }

}
