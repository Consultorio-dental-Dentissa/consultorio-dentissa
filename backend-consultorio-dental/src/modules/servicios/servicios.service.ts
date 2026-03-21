import { BadRequestException, Injectable } from '@nestjs/common';
import { RepositorioServicios } from './repositories/servicios.repository';
import { CrearServicioDto } from './dto/CrearServicioDto';

@Injectable()
export class ServiciosService {

    constructor(private repositorioServicios: RepositorioServicios) {}

    async obtenerTodos() {
        return this.repositorioServicios.obtenerTodos();
    }

    async crearServicio(crearServicioDto: CrearServicioDto) {

        const existeServicio = await this.repositorioServicios.existeServicioPorNombre(crearServicioDto.nombre);

        if (existeServicio) {
            throw new BadRequestException('Ya existe un servicio con este nombre');
        }

        if (crearServicioDto.precio <= 0) {
            throw new BadRequestException('El servico debe tene run precio mayor a cero');
        }

        // Covertir la hora en minutos
        const [horas, minutos] = crearServicioDto.duracion_horas.split(':').map(Number);
        crearServicioDto.duracion_minutos = horas * 60 + minutos;

        if (crearServicioDto.duracion_minutos < 30) {
            throw new BadRequestException('La duración debe ser mayor a 30 minutos');
        }

        return this.repositorioServicios.crear(crearServicioDto);
    }
}
