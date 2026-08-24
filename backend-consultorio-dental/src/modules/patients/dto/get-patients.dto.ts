import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPatientsDto {
    @IsOptional()
    @Transform(({ value }) => value === 'ACTIVO')
    status?: boolean;

    @IsOptional()
    search?: string;
}
