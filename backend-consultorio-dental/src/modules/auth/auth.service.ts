import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { IniciarSesionDto } from './dtos/IniciarSesionDto';
import { RepositorioUsuario } from 'src/modules/usuarios/repositories/usuarios.repository';

@Injectable()
export class AuthService {

    constructor(private repositorioUsuario : RepositorioUsuario) {}

    async iniciar_sesion(credenciales : IniciarSesionDto) {
        
        const usuario = this.repositorioUsuario.obtenerUsuarioPorCorreoConContraseña(credenciales.correo);

        if (!usuario) {
            throw new NotFoundException('Este usuario no existe');
        }

        
    }

    /*
    iniciar_session(datos, response) {
        
        if (!datos.correo || !datos.contraseña) {
            throw new BadRequestException('Los datos no son correctos');
        }

        const token = 'Token-de-ejemplo';

        response.cookie("token", token, {
            httpOnly: true,
            secure: process.env["ON_PRODUCTION"],
            sameSite: "lax",
            maxAge: 1000 * 9
        });

        return {
            estado: true,
            token: token,
            message: 'Bienvenido',
            usuario: {
                id: 1,
                nombre: 'Nombre-de-ejemplo',
                correo: datos.correo
            }
        }
    }
        */

}
