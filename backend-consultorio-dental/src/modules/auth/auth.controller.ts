import { Body, Controller, Post, Delete, Res, Req } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post('login')
    login(@Body() credentials: LoginDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(credentials, response);
    }

    @Post('refresh')
    refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        return this.authService.refresh(request, response);
    }

    @Delete('logout')
    logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(request, response);
    }

    @Post('register')
    register(@Body() user: RegisterUserDto) {
        return this.authService.registerUser(user);
    }
}
