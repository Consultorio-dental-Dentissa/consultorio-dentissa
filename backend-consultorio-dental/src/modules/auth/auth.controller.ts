import { Body, Controller, Post, Res } from '@nestjs/common';
import type { IniciarSesionDto } from './dto/IniciarSesionDto';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post()
    post(@Body() credenciales: IniciarSesionDto, /* @Res({ passthrough: true }) response: Response */) {
        return this.authService.iniciar_sesion(credenciales);
    }
    
    /* ApiResponse<{ token: string; usuario: LoginUser }> */ 

    /*
    {
        return this.authService.iniciar_session(datos, response);
    }
    */
}
