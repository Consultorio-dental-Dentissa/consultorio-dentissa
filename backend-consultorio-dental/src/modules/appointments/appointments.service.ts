import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ServicesRepository } from '../services/repositories/services.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';

@Injectable()
export class AppointmentsService {

    constructor(
        private appointmentRepository: AppointmentsRepository,
        private servicesRepository: ServicesRepository,
        private patientsRepository: PatientsRepository

    ) { }

    async getAllAppointments() {
        const appointments = await this.appointmentRepository.getAll();

        // TODO: Cambiar despues al patron DTO
        return appointments.map(appointment => {
            return {
                id: appointment.id,
                date: appointment.date,
                time: appointment.time,
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

        const appointmentsOfTheDate = await this.appointmentRepository.getAppointmentsByDate(new Date(createAppointmentDto.date));

        if (this.existsScheduleConflict(
            createAppointmentDto.time,
            createAppointmentDto.durationMinutes,
            appointmentsOfTheDate)) {
            throw new ConflictException(
                `Ya existe una cita agendada a las ${createAppointmentDto.time}, por favor selecciona un horario diferente`
            );
        }

        const appointment = await this.appointmentRepository.create(createAppointmentDto);

        return {
            id: appointment.id,
            date: appointment.date,
            time: appointment.time,
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
        time: string,
        dutationMinutes: number,
        appointments: { time: string, durationMinutes: number }[]) {

        const [newAppointmentTime, newAppointmentDurationMinutes] = time.split(':').map(Number);
        const newAppointmentBeginsTime = newAppointmentTime * 60 + newAppointmentDurationMinutes;
        const newAppointmentEndTime = newAppointmentBeginsTime + dutationMinutes;

        return appointments.some(appointment => {
            const [eh, em] = appointment.time.split(':').map(Number);
            const existstedAppointmentStartTime = eh * 60 + em;
            const existstAppointmentEndTime = existstedAppointmentStartTime + appointment.durationMinutes;

            return newAppointmentBeginsTime < existstAppointmentEndTime && newAppointmentEndTime > existstedAppointmentStartTime;
        });

    }

}
