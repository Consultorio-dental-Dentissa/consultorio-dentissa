import { BadRequestException, ConflictException, Injectable, NotAcceptableException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ServicesRepository } from '../services/repositories/services.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { GetAppointmentsDto } from './dto/get-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {

    constructor(
        private appointmentRepository: AppointmentsRepository,
        private servicesRepository: ServicesRepository,
        private patientsRepository: PatientsRepository

    ) { }

    async getAppointmentsCount(parameters: GetAppointmentsDto) {
        return await this.appointmentRepository.count(parameters);
    }

    async getAllAppointments(parameters: GetAppointmentsDto) {
        const appointments = await this.appointmentRepository.getAll(parameters);

        // TODO: Cambiar despues al patron DTO
        return appointments.map(appointment => {
            return {
                id: appointment.id,
                scheduled_at: appointment.scheduled_at,
                durationMinutes: appointment.durationMinutes,
                status: appointment.status,
                created_at: appointment.created_at,
                notes: appointment.notes,
                patient_id: appointment.patient_id,
                service_id: appointment.service_id,
                patient: {
                    name: appointment.patient.user.name,
                    lastname: appointment.patient.user.lastname
                },
                service: {
                    name: appointment.service.name
                }
            }
        })
    }

    async getAppointmentById(id: number) {
        return await this.appointmentRepository.getById(id);
    }

    /**
     * INDICACIÓN:
     * El id del paciente se resuelve a partir del usuario autenticado
     * (nunca de un parámetro que mande el cliente), para que un paciente
     * solo pueda ver sus propias citas y no las de otro.
     */
    async getMyAppointments(userId: number) {

        const patient = await this.patientsRepository.getByUserId(userId);

        if (!patient) {
            throw new NotFoundException('No se encontró un paciente asociado a este usuario');
        }

        return await this.getAllAppointments({ patient_id: patient.id });
    }

    async createAppoinment(createAppointmentDto: CreateAppointmentDto) {

        
        const [existsPatient, service] = await Promise.all([
            this.patientsRepository.existById(createAppointmentDto.patient_id),
            this.servicesRepository.getById(createAppointmentDto.service_id)
        ]);

        if (!existsPatient) throw new NotFoundException('Paciente no encontrado');
        if (!service) throw new NotFoundException('Servicio no encontrado');

        /**
         * TODO: Recordar cambiar la logica cuando se 
         * implementen multiples servicios en una sola cita
         */

        if (!service.status) {
            throw new NotAcceptableException('EL servicio que selecionaste está desactivado. Por favor escoje uno disponible');
        }

        createAppointmentDto.durationMinutes = service.durationMinutes;
        
        const appointmentsOfTheDate = await this.appointmentRepository.getAppointmentsByDate(createAppointmentDto.scheduled_at);
        const conflict = this.existsScheduleConflict(createAppointmentDto, appointmentsOfTheDate); 

        if (conflict) {
            throw new ConflictException(this.formatScheduleConflictMessage(conflict));
        }

        const appointment = await this.appointmentRepository.create(createAppointmentDto);
        
        if (!appointment) {
            throw new UnprocessableEntityException('Algo ha salido mal. Intentalo mas tarde')
        }

        return {
            id: appointment.id,
            scheduled_at: appointment.scheduled_at,
            durationMinutes: appointment.durationMinutes,
            status: appointment.status,
            notes: appointment.notes,
            created_at: appointment.created_at,
            patient_id: appointment.patient_id,
            service_id: appointment.service_id,
            patient: {
                name: appointment.patient.user.name,
                lastname: appointment.patient.user.lastname
            },
            service: {
                name: appointment.service.name
            }
        }
    }

    async updateAppointment(id: number, updateAppointmentDto: UpdateAppointmentDto) {

        const existingAppointment = await this.appointmentRepository.getById(id);

        if (!existingAppointment) {
            throw new NotFoundException('Cita no encontrada');
        }

        const [existsPatient, service] = await Promise.all([
            this.patientsRepository.existById(updateAppointmentDto.patient_id),
            this.servicesRepository.getById(updateAppointmentDto.service_id)
        ]);

        if (!existsPatient) throw new NotFoundException('Paciente no encontrado');
        if (!service) throw new NotFoundException('Servicio no encontrado');

        if (!service.status) {
            throw new NotAcceptableException('EL servicio que selecionaste está desactivado. Por favor escoje uno disponible');
        }

        const durationMinutes = service.durationMinutes;

        /**
         * INDICACIÓN:
         * Si la cita ya tiene una consulta registrada, su estatus queda
         * congelado (el resto de los campos sí se pueden seguir editando).
         */
        const hasConsultation = await this.appointmentRepository.hasConsultation(id);

        if (hasConsultation && updateAppointmentDto.status !== existingAppointment.status) {
            throw new NotAcceptableException('No puedes cambiar el estado de la cita si ya tiene una consulta registrada');
        }


        /**
         * INDICACIÓN (RF-012):
         * Una cita cancelada no ocupa horario, por lo que no tiene
         * sentido validar choques de horario contra sí misma ni contra otras.
         */
        if (updateAppointmentDto.status !== AppointmentStatus.CANCELADA) {

            const appointmentsOfTheDate = await this.appointmentRepository.getAppointmentsByDate(
                updateAppointmentDto.scheduled_at,
                id
            );

            const conflict = this.existsScheduleConflict(
                { scheduled_at: updateAppointmentDto.scheduled_at, durationMinutes },
                appointmentsOfTheDate
            );

            if (conflict) {
                throw new ConflictException(this.formatScheduleConflictMessage(conflict));
            }
        }

        const updatedAppointment = await this.appointmentRepository.update(id, {
            ...updateAppointmentDto,
            durationMinutes,
        });

        return {
            id: updatedAppointment.id,
            scheduled_at: updatedAppointment.scheduled_at,
            durationMinutes: updatedAppointment.durationMinutes,
            status: updatedAppointment.status,
            notes: updatedAppointment.notes,
            created_at: updatedAppointment.created_at,
            patient_id: updatedAppointment.patient_id,
            service_id: updatedAppointment.service_id,
            patient: {
                name: updatedAppointment.patient.user.name,
                lastname: updatedAppointment.patient.user.lastname
            },
            service: {
                name: updatedAppointment.service.name
            }
        }
    }

    /**
     * Crear la logica para verificar si el tiempo, fecha y hora de una cita
     * choca con el de una ya establecida */

    private existsScheduleConflict(
        pendingAppointment: { scheduled_at: Date, durationMinutes: number },
        appointments: {scheduled_at: Date, durationMinutes: number}[]
    ) {
            const startPendingAppointment = new Date(pendingAppointment.scheduled_at);
            const endPendingAppointment = new Date(pendingAppointment.scheduled_at);

            endPendingAppointment.setMinutes(startPendingAppointment.getMinutes() + pendingAppointment.durationMinutes);

            for (const appointment of appointments) {

                const startScheludedAppointment = new Date(appointment.scheduled_at);
                appointment.scheduled_at.setMinutes(startScheludedAppointment.getMinutes() + appointment.durationMinutes);
                const endScheludedAppointment = new Date(appointment.scheduled_at);

                if (
                    (startPendingAppointment >= startScheludedAppointment && startPendingAppointment <= endScheludedAppointment) || (endPendingAppointment >= startScheludedAppointment && endPendingAppointment <= endScheludedAppointment)
                ) {
                    return { startDate: startScheludedAppointment, endDate: endScheludedAppointment };
                }
            }
    }

    /**
     * INDICACIÓN:
     * toLocaleTimeString() sin argumentos usa la zona horaria del
     * servidor, no la de la clínica. En producción (Railway) el
     * servidor corre en UTC, así que el mensaje mostraba la hora
     * desfasada respecto a la hora real de México. Se fuerza la
     * zona horaria explícitamente para que el mensaje sea correcto
     * sin importar dónde esté desplegado el servidor.
     */
    private formatScheduleConflictMessage(conflict: { startDate: Date; endDate: Date }): string {

        const formatter = new Intl.DateTimeFormat('es-MX', {
            timeZone: 'America/Mexico_City',
            hour: '2-digit',
            minute: '2-digit',
        });

        return `El horario choca con una cita agendada de ${formatter.format(conflict.startDate)} a ${formatter.format(conflict.endDate)}. Porfavor escoja otro horario disponible`;
    }
}
