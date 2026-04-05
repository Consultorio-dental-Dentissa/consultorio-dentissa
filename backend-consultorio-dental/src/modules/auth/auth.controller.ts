import { Body, Controller, Post, Delete, Res } from '@nestjs/common';
import { IniciarSesionDto } from './dto/IniciarSesionDto';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';

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
    register(@Body() usuario: RegistrarUsuarioDto) {
        return this.authService.registrarUsuario(usuario);
    }
    
    @Post('verificar-prueba')
    get(@Body() credenciales : any): Promise<any> {
        return this.authService.verificar_token(credenciales)
    }
}
