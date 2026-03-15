import { Body, Controller, Post, Get, Res } from '@nestjs/common';
import type { IniciarSesionDto } from './dto/IniciarSesionDto';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post()
    login(@Body() credenciales: IniciarSesionDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.iniciar_sesion(credenciales, response);
    }  

    /**
     * TODO: Hacer un metodo exclusivo para 
     * registrar usuarios pacientes desde la vantana
     * de registrarse en el frontend
     */

    
    @Post('verificar-prueba')
    get(@Body() credenciales : any): Promise<any> {
        return this.authService.verificar_token(credenciales)
    }
}
