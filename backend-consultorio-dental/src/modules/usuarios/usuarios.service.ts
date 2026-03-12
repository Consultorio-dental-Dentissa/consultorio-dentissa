import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { RepositorioUsuario } from './repositories/usuarios.repository';
import { CrearUsuarioDto } from './dto/CrearUsuarioDto';
import type { Usuario } from '@prisma/client';

@Injectable()
export class UsuariosService {

    constructor(private repositorioUsuario : RepositorioUsuario) {}



    async obtenerTodos() : Promise<Usuario[]> {
        return await this.repositorioUsuario.obtenerTodos();
    }


    async obtenerUsuario (id: number) : Promise<Usuario> {

        const usuario = await this.repositorioUsuario.obtenerUsuarioPorId(id);

        if (!usuario) {
            throw new NotFoundException('El usuario no se ha encontrado');
        }

        return usuario;
    }

    /*
    async crearUsuario(crearUsuarioDto : CrearUsuarioDto) {

        const existeCorreo = await this.repositorioUsuario.existeCorreo(crearUsuarioDto.correo);
        
        if (existeCorreo) {
            throw new BadRequestException('Este correo ya esta registrado');
        }

        const existeTelefono = await this.repositorioUsuario.existeTelefono(crearUsuarioDto.telefono);

        if (existeTelefono) {
            throw new BadRequestException('Este telefono ya esta registrado');
        }
        
        const usuario = await this.repositorioUsuario.crearUsuario(crearUsuarioDto);

        if (usuario.rol.rol === 'PACIENTE') {
            throw new BadRequestException('Es paciente ejemplo');
        }
        
        return usuario;

    }
    */
}
