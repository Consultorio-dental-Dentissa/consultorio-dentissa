import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { IsActiveUserGuard } from './guards/is-active-user.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    providers: [
        AuthGuard,
        IsActiveUserGuard,
        RolesGuard,
        JwtService
    ],
    exports: [
        AuthGuard,
        IsActiveUserGuard,
        RolesGuard,
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
