import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { IsActiveUserGuard } from './guards/is-active-user.guard';

@Module({
    providers: [
        AuthGuard,
        IsActiveUserGuard,
        JwtService
    ],
    exports: [
        AuthGuard, 
        IsActiveUserGuard,
        JwtModule
    ],
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET!,
            signOptions: { expiresIn: '1d' }
        }),
    ]
})
export class SecurityModule { }
