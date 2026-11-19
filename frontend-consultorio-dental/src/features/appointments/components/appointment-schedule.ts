import * as z from "zod";
import { clinicDateTimeToDate, clinicTodayKey } from "@/utils/clinic-time";

/** Combina fecha (AAAA-MM-DD) y hora (HH:mm) de la zona del consultorio en un instante. */
export function combineDateTime(date: string, time: string): Date {
    return clinicDateTimeToDate(date, time.slice(0, 5));
}

/** Campos de fecha/hora compartidos por "crear" y "reprogramar". */
export const scheduleFields = {
    date: z.string().min(1, "Selecciona una fecha"),
    time: z.string().min(1, "Selecciona una hora"),
};

/** Agrega el error "debe ser futura" sobre date/time. */
export function refineFutureSchedule(
    data: { date: string; time: string },
    ctx: z.RefinementCtx,
) {
    const date = data.date;
    if (!data.date || !data.time) return;

    const scheduledAt = combineDateTime(data.date, data.time);
    const now = new Date();

    if (Number.isNaN(scheduledAt.getTime())) {
        ctx.addIssue({ code: "custom", path: ["date"], message: "La fecha no es válida" });
        return;
    }

    if (scheduledAt.getTime() <= now.getTime()) {
        const sameDay = date === clinicTodayKey(now);
        ctx.addIssue({
            code: "custom",
            path: [sameDay ? "time" : "date"],
            message: sameDay
                ? "La hora debe ser posterior a la hora actual"
                : "La fecha no puede ser anterior a hoy",
        });
    }
}
