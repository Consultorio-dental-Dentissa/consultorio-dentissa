import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { RepositorioUsuario } from './repositories/usuarios.repository';
import { CrearUsuarioDto } from './dto/CrearUsuarioDto';
import type { Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Rol } from './enums/rol.enum';


@Injectable()
export class UsuariosService {

    constructor(private repositorioUsuario: RepositorioUsuario) {}


    async obtenerTodos(): Promise<Usuario[]> {
        return await this.repositorioUsuario.obtenerTodos();
    }


    async obtenerUsuario(id: number) {

        console.log("2. Pasamos por el servicio de usuarios");
        
        const usuario = await this.repositorioUsuario.obtenerUsuarioPorId(id);

        if (!usuario) {
            throw new NotFoundException('El usuario no se ha encontrado');
        }

        return usuario;
    }


    async crearUsuario(crearUsuarioDto: CrearUsuarioDto) {

        const existeCorreo = await this.repositorioUsuario.existeCorreo(crearUsuarioDto.correo);

        if (existeCorreo) {
            throw new BadRequestException('Este correo ya esta registrado');
        }

        const existeTelefono = await this.repositorioUsuario.existeTelefono(crearUsuarioDto.telefono);

        if (existeTelefono) {
            throw new BadRequestException('Este telefono ya esta registrado');
        }

        const contraseña_hasheada = await bcrypt.hash(crearUsuarioDto.contraseña, 10);
        
        crearUsuarioDto.contraseña = contraseña_hasheada;


        /**
         * TODO: Buscar la forma de que si el usuario tiene rol de paciente, se registre el paciente
         * inmediatamente despues del usuario. De esto fallar, hacer un rollback a la base de datos
         * para no dejar al usuario registrado sin un registro de paciente relacionado.
         */

        const usuario = await this.repositorioUsuario.crearUsuario(crearUsuarioDto);

        if (usuario.rol.rol === Rol.PACIENTE) {
            throw new BadRequestException('Es paciente ejemplo');
        }

        return usuario;
    }
}
