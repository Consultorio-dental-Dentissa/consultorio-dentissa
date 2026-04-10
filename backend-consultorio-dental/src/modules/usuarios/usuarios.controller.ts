import { Controller, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Get, Post, Patch,  Body, NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/CrearUsuarioDto';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';

@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('usuarios')
export class UsuariosController {

    constructor(private servicioUsuario: UsuariosService) { }

    @Get()
    async get() {
        return await this.servicioUsuario.obtenerTodos();
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {

        console.log("1. Pasamos por el controlador de usuarios");
        
        return await this.servicioUsuario.obtenerUsuario(id);
    }


    @Post()
    async post(@Body() crearUsuarioDto: CrearUsuarioDto) {
        return await this.servicioUsuario.crearUsuario(crearUsuarioDto);
    }

    @Patch(':id/estado')
    async cambiarEstado(@Param ('id', ParseIntPipe) id: number, @Body () body: { estado: boolean }) {
        return await this.servicioUsuario.cambiarEstadoDeUsuario(id, body.estado);
    }

}
