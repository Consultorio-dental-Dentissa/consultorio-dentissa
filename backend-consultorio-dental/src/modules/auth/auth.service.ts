import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IniciarSesionDto } from './dto/IniciarSesionDto';
import { RepositorioUsuario } from 'src/modules/usuarios/repositories/usuarios.repository';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {

    constructor(private repositorioUsuario: RepositorioUsuario) { }

    async iniciar_sesion(credenciales: IniciarSesionDto) {

        const usuario = await this.repositorioUsuario.obtenerUsuarioPorCorreoConContraseña(credenciales.correo);

        if (!usuario) {
            throw new NotFoundException('Este usuario no existe');
        }

        const contraseña_correcta = await bcrypt.compare(credenciales.contraseña, usuario.contraseña);

        if (!contraseña_correcta) {
            throw new UnauthorizedException('Datos incorrectos');
        }

        const usuario_autenticado = {
            logged: true,
            token: "token-de-ejemplo",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                telefono: usuario.telefono,
                rol: usuario.rol.rol,
            }
        }

        return usuario_autenticado;
    }
}
