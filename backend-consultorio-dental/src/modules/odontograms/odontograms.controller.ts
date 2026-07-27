import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { OdontogramsService } from './odontograms.service';
import { UpdateToothDto } from './dto/update-tooth.dto';
import { AuthGuard } from 'src/infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from 'src/infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from 'src/infrastructure/security/guards/roles.guard';
import { Roles } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles([Role.ADMINISTRADOR, Role.ASISTENTE])
@Controller('odontograms')
export class OdontogramsController {

    constructor(private odontogramsService: OdontogramsService) { }

    @Get('patient/:patientId')
    async getByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
        return await this.odontogramsService.getOdontogramByPatientId(patientId);
    }

    @Put('teeth/:id')
    async updateTooth(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateToothDto: UpdateToothDto,
    ) {
        return await this.odontogramsService.updateTooth(id, updateToothDto);
    }
}
