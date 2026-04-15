import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IniciarSesionDto } from './dto/IniciarSesionDto';
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service';
import { Rol } from '../users/enums/rol.enum';
import { RegisterUserDto } from './dto/registrar-usuario.dto';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async iniciarSesion(credenciales: IniciarSesionDto, response: Response) {

        const user = await this.usersService.getUserByEmailWithPassword(credenciales.correo);
        const esContraseñaCorrecta = await bcrypt.compare(credenciales.contraseña, user?.password ?? '');

        if (!user || !esContraseñaCorrecta) {
            throw new NotFoundException('Las credenciales son incorrectas');
        }

        if (!user.status) {
            throw new UnauthorizedException('Tu cuenta ha sido desactivada');
        }
        
        const payload = {
            id: user.id,
            nombre: user.name,
            apellido: user.lastname,
            correo: user.email,
            telefono: user.phone,
            rol: user.rol.rol,
            activo: user.status
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
                id: user.id,
                nombre: user.name,
                apellido: user.lastname,
                correo: user.email,
                telefono: user.phone,
                rol: user.rol.rol,
            }
        }

        return usuarioAutenticado;
    }

    async cerrarSesion(response: Response) {

        response.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        });

        // return true;
    }


    async crearToken(payload) {
        return await this.jwtService.signAsync(payload);
    }
    

    async registrarUsuario(user: RegisterUserDto) {
        
        const usuarioPaciente = {
            ...user,
            rol: Rol.PACIENTE
        }
        return await this.usersService.createUser(usuarioPaciente);
    }
}
