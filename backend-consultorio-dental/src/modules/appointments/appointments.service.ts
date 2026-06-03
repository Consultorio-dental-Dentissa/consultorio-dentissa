import { BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ServicesRepository } from '../services/repositories/services.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { GetAppointmentsDto } from './dto/get-appointment.dto';

@Injectable()
export class AppointmentsService {

    constructor(
        private appointmentRepository: AppointmentsRepository,
        private servicesRepository: ServicesRepository,
        private patientsRepository: PatientsRepository

    ) { }

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

        createAppointmentDto.durationMinutes = service.durationMinutes;
        const appointmentsOfTheDate = await this.appointmentRepository.getAppointmentsByDate(createAppointmentDto.scheduled_at);
        const conflict = this.existsScheduleConflict(createAppointmentDto, appointmentsOfTheDate); 

        if (conflict) {
            throw new ConflictException(
                `El horario choca con una cita agendada de ${conflict.startDate.toLocaleTimeString()} a ${conflict.endDate.toLocaleTimeString()}. Porfavor escoja otro horario disponible`
            )
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
            patient: {
                name: appointment.patient.user.name,
                lastname: appointment.patient.user.lastname
            },
            service: {
                name: appointment.service.name
            }
        }
    }

    /**
     * Crear la logica para verificar si el tiempo, fecha y hora de una cita
     * choca con el de una ya establecida */

    private existsScheduleConflict(
        pendingAppointment: CreateAppointmentDto,
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
}
