import { Body, Controller, Post, Get, Res } from '@nestjs/common';
import type { IniciarSesionDto } from './dto/IniciarSesionDto';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { RegistrarUsuarioDto } from './dto/registrarUsuarioDto';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post('iniciar-sesion')
    login(@Body() credenciales: IniciarSesionDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.iniciar_sesion(credenciales, response);
    }  

    @Post('registrar')
    register(@Body() registroDto: RegistrarUsuarioDto) {
        return this.authService.registrarUsuario(registroDto);
    }

    
    @Post('verificar-prueba')
    get(@Body() credenciales : any): Promise<any> {
        return this.authService.verificar_token(credenciales)
    }
}
