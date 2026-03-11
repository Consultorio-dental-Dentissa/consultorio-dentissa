import { Body, Controller, Post, Res } from '@nestjs/common';
import type { LoginDto } from './dtos/LoginDto';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    /*
    constructor(private authService : AuthService) {}

    @Post()
    post(@Body() datos: LoginDto, @Res({ passthrough: true }) response: Response): any
    
    /* ApiResponse<{ token: string; usuario: LoginUser }> */ 

    /*
    {
        return this.authService.iniciar_session(datos, response);
    }
    */
}
