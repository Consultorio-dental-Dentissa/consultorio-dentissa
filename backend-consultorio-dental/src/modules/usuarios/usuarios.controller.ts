import { Controller, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Get, Post, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import type { CrearUsuarioDto } from './dto/CrearUsuarioDto';
import { AuthGuard } from '../security/guards/auth.guard';


@UseGuards(AuthGuard)
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

}
