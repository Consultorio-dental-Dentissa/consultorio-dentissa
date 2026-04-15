import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RepositorioCitas } from './repositories/citas.repository';
import { CrearCitaDto } from './dto/CrearCitaDto';
import { RepositorioServicios } from '../servicios/repositories/servicios.repository';
import { RepositorioPaciente } from '../pacientes/repositories/pacientes.repository';

@Injectable()
export class CitasService {

    constructor(
        private repositorioCitas: RepositorioCitas,
        private repositorioServicios: RepositorioServicios,
        private repositorioPaciente: RepositorioPaciente

    ) { }

    async obtenerCitas() {
        const citas = await this.repositorioCitas.obtenerTodos();

        // TODO: Cambiar despues al patron DTO
        return citas.map(cita => {
            return {
                id: cita.id,
                fecha: cita.fecha,
                hora: cita.hora,
                duracion_minutos: cita.duracion_minutos,
                estado: cita.estado,
                created_at: cita.created_at,
                paciente: {
                    nombre: cita.paciente.usuario.name,
                    apellido: cita.paciente.usuario.lastname
                },
                servicio: {
                    nombre: cita.servicio.nombre
                }
            }
        })
    }

    async obtenerCitaPorId(id: number) {
        return await this.repositorioCitas.obtenerCitaPorId(id);
    }

    async crearCita(crearCitaDto: CrearCitaDto) {

        const [existePaciente, servicio] = await Promise.all([
            this.repositorioPaciente.existePacientePorId(crearCitaDto.paciente_id),
            this.repositorioServicios.obtenerServicioPorId(crearCitaDto.servicio_id)
        ]);

        if (!existePaciente) throw new NotFoundException('Paciente no encontrado');
        if (!servicio) throw new NotFoundException('Servicio no encontrado');

        /**
         * TODO: Recordar cambiar la logica cuando se 
         * implementen multiples servicios en una sola cita
         */

        crearCitaDto.duracion_minutos = servicio.duracion_minutos;

        const citasDelDia = await this.repositorioCitas.obtenerCitasPorFecha(new Date(crearCitaDto.fecha));

        if (this.existeConflictoDeHorario(
            crearCitaDto.hora,
            crearCitaDto.duracion_minutos,
            citasDelDia)) {
            throw new ConflictException(
                `Ya existe una cita agendada a las ${crearCitaDto.hora}, por favor selecciona un horario diferente`
            );
        }

        const cita = await this.repositorioCitas.crear(crearCitaDto);

        return {
            id: cita.id,
            fecha: cita.fecha,
            hora: cita.hora,
            duracion_minutos: cita.duracion_minutos,
            estado: cita.estado,
            created_at: cita.created_at,
            paciente: {
                nombre: cita.paciente.usuario.name,
                apellido: cita.paciente.usuario.lastname
            },
            servicio: {
                nombre: cita.servicio.nombre
            }
        }
    }

    /**
     * Crear la logica para verificar si el tiempo, fecha y hora de una cita
     * choca con el de una ya establecida */

    private existeConflictoDeHorario(
        hora: string,
        duracionMinutos: number,
        citasDelDia: { hora: string, duracion_minutos: number }[]) {

        const [nuevaCitaHora, nuevaCitaMinutos] = hora.split(':').map(Number);
        const nuevaInicio = nuevaCitaHora * 60 + nuevaCitaMinutos;
        const nuevaFin = nuevaInicio + duracionMinutos;

        return citasDelDia.some(cita => {
            const [eh, em] = cita.hora.split(':').map(Number);
            const existenteInicio = eh * 60 + em;
            const existenteFin = existenteInicio + cita.duracion_minutos;

            return nuevaInicio < existenteFin && nuevaFin > existenteInicio;
        });

    }

}
