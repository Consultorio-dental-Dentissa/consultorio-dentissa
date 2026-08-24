import { IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../enums/rol.enum';

export class GetUsersDto {
    @IsOptional()
    @IsEnum(Role, { message: `El rol debe ser de: ${Object.values(Role)}` })
    role?: Role;

    @IsOptional()
    @Transform(({ value }) => value === 'ACTIVO')
    status?: boolean;

    @IsOptional()
    search?: string;
}
