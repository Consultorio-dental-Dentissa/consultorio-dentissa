import {
  Body,
  Controller,
  Post,
  Delete,
  Get,
  Patch,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { UserThrottlerGuard } from '../../infrastructure/security/guards/user-throttler.guard';
import type { AuthRequest } from '../../infrastructure/security/auth-request';

const ONE_MINUTE_MS = 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: ONE_MINUTE_MS } })
  @Post('login')
  login(
    @Body() credentials: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(credentials, response);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: ONE_MINUTE_MS } })
  @Post('refresh')
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(request, response);
  }

  @Delete('logout')
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(request, response);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: ONE_MINUTE_MS } })
  @Post('register')
  register(@Body() user: RegisterUserDto) {
    return this.authService.registerUser(user);
  }

  @UseGuards(AuthGuard, IsActiveUserGuard)
  @Get('me')
  me(@Req() request: AuthRequest) {
    return this.authService.me(request.user!.id);
  }

  @UseGuards(AuthGuard, IsActiveUserGuard, UserThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: ONE_MINUTE_MS } })
  @Patch('password')
  changePassword(@Req() request: AuthRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(request.user!.id, dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: ONE_MINUTE_MS } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: ONE_MINUTE_MS } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
