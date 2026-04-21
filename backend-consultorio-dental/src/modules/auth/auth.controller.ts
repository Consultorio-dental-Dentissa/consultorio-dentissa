import { Body, Controller, Post, Delete, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post('login')
    login(@Body() credentials: LoginDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(credentials, response);
    }

    @Delete('logout')
    logout(@Res({ passthrough: true }) response: Response) {
        return this.authService.logout(response);
    }

    @Post('register')
    register(@Body() user: RegisterUserDto) {
        return this.authService.registerUser(user);
    }
}
