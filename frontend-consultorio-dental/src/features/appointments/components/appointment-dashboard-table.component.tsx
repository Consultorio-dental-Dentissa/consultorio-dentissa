import { StatusSpan } from "@/components/shared/span.component"
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { Spinner } from "@/components/ui/spinner";

export function AppointmentsDashboardTable() {

  const appointments = useAppointments();

  if (appointments.isLoading) {
    return (
      <div className="p-5">
        <Spinner />
      </div>
    )
  }

  if (!appointments.data?.length) {
    return (
      <div className="p-5">
        No se encontraron citas
      </div>
    )
  }

  return (
    <div className="border overflow-hidden w-full">
      <div className="grid grid-cols-[1.5fr_1.2fr_0.7fr_1fr] px-5 py-2.5 border-b bg-zinc-50 border-zinc-100 text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide">
        <span>Paciente</span>
        <span>Servicio</span>
        <span>Hora</span>
        <span>Estatus</span>
      </div>

      {appointments.data.map((appointment, index) => {

        return (
          <div
            key={index}
            className="grid grid-cols-[1.5fr_1.2fr_0.7fr_1fr] items-center px-5 py-3 border-b border-zinc-100 last:border-b-0"
          >
            <div className="flex items-center gap-3 min-w-0">

              <div className="text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                {appointment.patient.name}
              </div>
            </div>

            <div className="text-[12.5px] text-zinc-600 font-medium">
              {appointment.service.name}
            </div>

            <div className="text-[12.5px] text-zinc-700 font-semibold">
              {appointment.scheduled_at.toLocaleTimeString()}
            </div>

            <div>
              
                <StatusSpan 
                    status={appointment.status}
                />
            </div>
          </div>
        );
      })}
    </div>
  );
}