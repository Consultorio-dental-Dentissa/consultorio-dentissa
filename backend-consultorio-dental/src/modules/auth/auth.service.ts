import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IniciarSesionDto } from './dto/IniciarSesionDto';
import { RepositorioUsuario } from 'src/modules/usuarios/repositories/usuarios.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'
import type { Response } from 'express';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistrarUsuarioDto } from './dto/registrarUsuarioDto';
import { Rol } from '../usuarios/enums/rol.enum';


@Injectable()
export class AuthService {

    constructor(
        private usuariosService: UsuariosService,
        private jwtService: JwtService
    ) { }

    async iniciar_sesion(credenciales: IniciarSesionDto, response: Response) {

        const usuario = await this.usuariosService.ObtenerUsuarioPorCorreoConContraseña(credenciales.correo);

        if (!usuario) {
            throw new NotFoundException('Este usuario no existe');
        }

        const contraseña_correcta = await bcrypt.compare(credenciales.contraseña, usuario.contraseña);

        if (!contraseña_correcta) {
            throw new UnauthorizedException('Datos incorrectos');
        }

        if (!usuario.activo) {
            throw new UnauthorizedException('Tu cuenta ha sido desactivada');
        }
        
        const payload = {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            telefono: usuario.telefono,
            rol: usuario.rol.rol,
            activo: usuario.activo
        };

        const token = await this.crearToken(payload);

        
        response.cookie('access_token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
        });
        

        const usuario_autenticado = {
            estado: true,
            token: token,
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


    async crearToken(payload) {
        return await this.jwtService.signAsync(payload);
    }

    
    async verificar_token(credenciales: any) {
        return await this.jwtService.verifyAsync(credenciales.token);
    }


    async registrarUsuario(registroUsuario: RegistrarUsuarioDto) {
        registroUsuario.rol = Rol.PACIENTE;
        return await this.usuariosService.crearUsuario(registroUsuario);
    }
}
