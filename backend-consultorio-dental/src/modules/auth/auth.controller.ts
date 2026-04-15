import { Body, Controller, Post, Delete, Res } from '@nestjs/common';
import { IniciarSesionDto } from './dto/IniciarSesionDto';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/registrar-usuario.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post('iniciar-sesion')
    login(@Body() credenciales: IniciarSesionDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.iniciarSesion(credenciales, response);
    }

    @Delete('cerrar-sesion')
    logout(@Res({ passthrough: true }) response: Response) {
        return this.authService.cerrarSesion(response);
    }

    @Post('registrar')
    register(@Body() usuario: RegisterUserDto) {
        return this.authService.registrarUsuario(usuario);
    }
}
