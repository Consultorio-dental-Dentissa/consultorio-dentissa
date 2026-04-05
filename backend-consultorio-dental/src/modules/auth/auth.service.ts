import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IniciarSesionDto } from './dto/IniciarSesionDto';
import { JwtService } from '@nestjs/jwt'
import { UsuariosService } from '../usuarios/usuarios.service';
import { Rol } from '../usuarios/enums/rol.enum';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private usuariosService: UsuariosService,
        private jwtService: JwtService
    ) { }

    async iniciarSesion(credenciales: IniciarSesionDto, response: Response) {

        const usuario = await this.usuariosService.ObtenerUsuarioPorCorreoConContraseña(credenciales.correo);
        const esContraseñaCorrecta = await bcrypt.compare(credenciales.contraseña, usuario?.contraseña ?? '');

        if (!usuario || !esContraseñaCorrecta) {
            throw new NotFoundException('Las credenciales son incorrectas');
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
        

        const usuarioAutenticado = {
            estado: true,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                telefono: usuario.telefono,
                rol: usuario.rol.rol,
            }
        }

        return usuarioAutenticado;
    }

    async cerrarSesion(response: Response) {

        console.log(response.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        }));

        // return true;
    }


    async crearToken(payload) {
        return await this.jwtService.signAsync(payload);
    }

    
    async verificar_token(credenciales: any) {
        return await this.jwtService.verifyAsync(credenciales.token);
    }


    async registrarUsuario(usuario: RegistrarUsuarioDto) {
        
        const usuarioPaciente = {
            ...usuario,
            rol: Rol.PACIENTE
        }
        return await this.usuariosService.crearUsuario(usuarioPaciente);
    }
}
