import { ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { ConsultationsRepository } from './repositories/consultations.repository';
import { AppointmentsRepository } from '../appointments/repositories/appointments.repository';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class ConsultationsService {

    constructor(
        private consultationsRepository: ConsultationsRepository,
        private appointmentsRepository: AppointmentsRepository,
    ) { }

    async getAllConsultations() {
        const consultations = await this.consultationsRepository.getAll();
        return consultations.map(consultation => this.mapConsultation(consultation));
    }

    async createConsultation(createConsultationDto: CreateConsultationDto) {

        const appointment = await this.appointmentsRepository.getById(createConsultationDto.appointment_id);

        if (!appointment) {
            throw new NotFoundException('La cita relacionada no existe');
        }

        /**
         * INDICACIÓN (RF-015):
         * Una consulta solo puede crearse cuando la cita relacionada
         * tiene estatus "Completada".
         */
        if (appointment.status !== AppointmentStatus.COMPLETADA) {
            throw new NotAcceptableException('Solo se puede registrar una consulta para una cita completada');
        }

        /**
         * INDICACIÓN:
         * appointment_id es único en el modelo Consultation (relación 1 a 1),
         * asi que no se puede registrar mas de una consulta por cita.
         */
        const alreadyHasConsultation = await this.consultationsRepository.existsByAppointmentId(createConsultationDto.appointment_id);

        if (alreadyHasConsultation) {
            throw new ConflictException('Esta cita ya tiene una consulta registrada');
        }

        const consultation = await this.consultationsRepository.create(createConsultationDto);

        return this.mapConsultation(consultation);
    }

    async updateConsultation(id: number, updateConsultationDto: UpdateConsultationDto) {

        const exists = await this.consultationsRepository.existsById(id);

        if (!exists) {
            throw new NotFoundException('La consulta no existe');
        }

        const consultation = await this.consultationsRepository.update(id, updateConsultationDto);

        return this.mapConsultation(consultation);
    }

    private mapConsultation(consultation: {
        id: number;
        notes: string;
        observations: string;
        created_at: Date;
        appointment_id: number;
        appointment: {
            scheduled_at: Date;
            patient: { user: { name: string; lastname: string } };
            service: { name: string };
        };
    }) {
        return {
            id: consultation.id,
            notes: consultation.notes,
            observations: consultation.observations,
            created_at: consultation.created_at,
            appointment_id: consultation.appointment_id,
            scheduled_at: consultation.appointment.scheduled_at,
            patient: {
                name: consultation.appointment.patient.user.name,
                lastname: consultation.appointment.patient.user.lastname
            },
            service: {
                name: consultation.appointment.service.name
            }
        };
    }
}
