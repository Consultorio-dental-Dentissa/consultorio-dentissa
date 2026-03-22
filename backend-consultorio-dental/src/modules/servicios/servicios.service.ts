import { BadRequestException, Injectable } from '@nestjs/common';
import { RepositorioServicios } from './repositories/servicios.repository';
import { CrearServicioDto } from './dto/CrearServicioDto';

@Injectable()
export class ServiciosService {

    constructor(private repositorioServicios: RepositorioServicios) {}

    async obtenerTodos() {
        return this.repositorioServicios.obtenerTodos();
    }

    async cambiarEstadoServicio(id: number, estado: boolean) {
        return this.repositorioServicios.cambiarEstado(id, estado);
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

        if (crearServicioDto.duracion_minutos < 30 || crearServicioDto.duracion_minutos > 120) {
            throw new BadRequestException('La duración del servicio debe ser minimo de 30 minutos y maximo de 2 horas');
        }

        return this.repositorioServicios.crear(crearServicioDto);
    }
}
