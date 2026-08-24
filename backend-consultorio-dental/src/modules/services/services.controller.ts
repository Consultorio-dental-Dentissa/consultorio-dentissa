import { Controller, Get, UseGuards, Post, Body, Delete, ParseIntPipe, Param, Patch, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { GetServicesDto } from './dto/get-services.dto';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { Public } from 'src/infrastructure/security/decorators/public.decorator';

@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('services')
export class ServiciosController {

    constructor(private servicesService: ServicesService) {}

    @Public()
    @Get()
    async get(@Query() filters: GetServicesDto) {
        return await this.servicesService.getAllServices(filters);
    }

    @Patch('status/:id')
    async updateStatus(@Param ('id', ParseIntPipe) id: number, @Body () body: {status: boolean}) {
        return await this.servicesService.updateServiceStatus(id, body.status);
    }

    @Post()
    async createService(@Body () createServiceDto: CreateServiceDto) {
        return await this.servicesService.createService(createServiceDto);
    }
}
