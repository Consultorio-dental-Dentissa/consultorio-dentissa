import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';

@Module({
    providers: [AuthGuard],
    exports: [AuthGuard, JwtModule],
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET!,
            signOptions: { expiresIn: '1d' }
        }),
    ]
})
export class SecurityModule { }
