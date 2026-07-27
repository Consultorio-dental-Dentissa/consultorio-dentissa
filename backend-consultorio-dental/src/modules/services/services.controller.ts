import { Controller, Get, UseGuards, Post, Body, Delete, ParseIntPipe, Param, Patch } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';
import { Public } from '../../infrastructure/security/decorators/public.decorator';

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Controller('services')
export class ServiciosController {

    constructor(private servicesService: ServicesService) {}

    /**
     * INDICACIÓN:
     * La vista pública (home page) necesita listar los servicios
     * sin que el visitante haya iniciado sesión.
     */
    @Public(true)
    @Get()
    async get() {
        return await this.servicesService.getAllServices();
    }

    @Roles([Role.ADMINISTRADOR, Role.ASISTENTE])
    @Patch('status/:id')
    async updateStatus(@Param ('id', ParseIntPipe) id: number, @Body () body: {status: boolean}) {
        return await this.servicesService.updateServiceStatus(id, body.status);
    }

    @Roles([Role.ADMINISTRADOR, Role.ASISTENTE])
    @Post()
    async createService(@Body () createServiceDto: CreateServiceDto) {
        return await this.servicesService.createService(createServiceDto);
    }
}
