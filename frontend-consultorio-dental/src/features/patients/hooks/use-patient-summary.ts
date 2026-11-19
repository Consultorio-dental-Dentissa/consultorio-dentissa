import { useMemo } from "react";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { clinicDayKey } from "@/utils/clinic-time";
import { useNow } from "@/hooks/use-now";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { usePatientAppointmentHistory } from "@/features/patients/hooks/use-patients";
import type { PatientAppointmentHistoryItem } from "@/features/patients/types/patient.model";

const SNAPSHOT_SIZE = 50;

const OPEN_STATUSES: string[] = [
    STATUS_APPOINTMENT.PENDIENTE,
    STATUS_APPOINTMENT.CONFIRMADA,
    STATUS_APPOINTMENT.REPROGRAMADA,
];

export interface PatientSummary {
    isPending: boolean;
    isError: boolean;
    /** Total real de citas del paciente (viene del servidor). */
    total: number | undefined;
    /** Última cita completada (ya ocurrida); si la muestra no alcanza se consulta aparte. */
    lastVisit: { scheduled_at: Date } | undefined;
    next: PatientAppointmentHistoryItem | undefined;
    /** true si la muestra cargada contiene TODAS las citas (los conteos por estatus son exactos). */
    complete: boolean;
    completed: number;
    canceled: number;
}

/**
 * Resumen del paciente (próxima cita, última visita, conteos) calculado con las citas más recientes que devuelve
 * GET /patients/:id/history. No hay endpoint de resumen: si el paciente tiene más de 50 citas, los conteos por
 * estatus se omiten (`complete = false`) en lugar de mostrar cifras parciales, y la última visita se pide aparte
 * (GET /appointments?status=COMPLETADA&sort=desc&limit=1). `useNow` hace que "Próxima cita" avance sola.
 */
export function usePatientSummary(patientId: number | undefined): PatientSummary {
    const now = useNow();
    const history = usePatientAppointmentHistory(patientId, { page: 1, limit: SNAPSHOT_SIZE });
    const items = history.data?.items;
    const total = history.data?.total;
    const complete = total !== undefined && total <= SNAPSHOT_SIZE;

    // Con más de 50 citas la muestra puede no contener la última completada: se consulta por separado.
    const lastCompleted = useAppointments(
        {
            patient_id: patientId, status: STATUS_APPOINTMENT.COMPLETADA, to: clinicDayKey(new Date(now)),
            sort: "desc", limit: 1,
        },
        patientId !== undefined && !Number.isNaN(patientId) && total !== undefined && !complete,
    );
    const remoteLast = lastCompleted.data?.items[0];

    return useMemo(() => {
        const list = items ?? [];
        const sampleLast = list
            .filter((item) => item.status === STATUS_APPOINTMENT.COMPLETADA && item.scheduled_at.getTime() <= now)
            .sort((a, b) => b.scheduled_at.getTime() - a.scheduled_at.getTime())[0];
        const lastVisit = complete ? sampleLast : (remoteLast ?? sampleLast);
        const next = list
            .filter((item) => item.scheduled_at.getTime() > now && OPEN_STATUSES.includes(item.status))
            .sort((a, b) => a.scheduled_at.getTime() - b.scheduled_at.getTime())[0];

        return {
            isPending: history.isPending,
            isError: history.isError,
            total,
            lastVisit,
            next,
            complete,
            completed: list.filter((item) => item.status === STATUS_APPOINTMENT.COMPLETADA).length,
            canceled: list.filter((item) => item.status === STATUS_APPOINTMENT.CANCELADA).length,
        };
    }, [items, total, now, complete, remoteLast, history.isPending, history.isError]);
}
