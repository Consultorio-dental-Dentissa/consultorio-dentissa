import { BadRequestException, Injectable } from '@nestjs/common';
import { RepositorioServicios } from './repositories/servicios.repository';
import { CrearServicioDto } from './dto/CrearServicioDto';

@Injectable()
export class ServiciosService {

    constructor(private repositorioServicios: RepositorioServicios) { }

    async obtenerTodos() {
        return this.repositorioServicios.obtenerTodos();
    }

    async cambiarEstadoServicio(id: number, estado: boolean) {
        return this.repositorioServicios.cambiarEstado(id, estado);
    }

    async crearServicio(crearServicioDto: CrearServicioDto) {

        if (crearServicioDto.duracion_minutos < 15 || crearServicioDto.duracion_minutos > 120) {
            throw new BadRequestException(
                'El servicio debe durar minimo 15 minutos y maximo 2 horas'
            )
        }

        const existeServicio = await this.repositorioServicios.existeServicioPorNombre(crearServicioDto.nombre);

        if (existeServicio) {
            throw new BadRequestException('Ya existe un servicio con este nombre');
        }

        return this.repositorioServicios.crear(crearServicioDto);
    }
}
