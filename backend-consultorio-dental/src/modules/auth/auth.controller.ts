import { Body, Controller, Post, Res } from '@nestjs/common';
import { IniciarSesionDto } from './dto/IniciarSesionDto';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CrearUsuarioDto } from '../usuarios/dto/CrearUsuarioDto';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post('iniciar-sesion')
    login(@Body() credenciales: IniciarSesionDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.iniciarSesion(credenciales, response);
    }  

    @Post('registrar')
    register(@Body() usuario: RegistrarUsuarioDto) {
        return this.authService.registrarUsuario(usuario);
    }
    
    @Post('verificar-prueba')
    get(@Body() credenciales : any): Promise<any> {
        return this.authService.verificar_token(credenciales)
    }
}
