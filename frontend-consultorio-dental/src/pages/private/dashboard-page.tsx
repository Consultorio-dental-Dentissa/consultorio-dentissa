import { PageTitle } from "@/components/shared/page-title.component";
import { formatDate } from "@/utils/formatters";
import { Calendar, SquarePlus, Users, MoveRight } from "lucide-react";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { AppointmentsDashboardTable } from "@/features/appointments/components/appointment-dashboard-table.component";
import { useMemo } from "react";
import toast from "react-hot-toast";

export default function DashboardPage() {

  const appointments = useAppointments();

  const totalAppointments = useMemo(() =>
    appointments.data ? appointments.data.length : 0, [appointments.data]
  );

  return (
    <>

      {appointments.error && toast.error(appointments.error.message)}

      <PageTitle
        titulo="Panel general"
        subtitulo={`Resumen del consultorio ${formatDate(new Date())}`}
      />

      <div className="flex w-full mt-3 gap-5">

        <CardDashboard
          title="Citas de hoy"
          data={totalAppointments.toString()}
          icon={Calendar}
        />

        <CardDashboard
          title="Servicios activos"
          data={`0`}
          icon={SquarePlus}
        />
        <CardDashboard
          title="Pacientes activos"
          data={`0`}
          icon={Users}
        />
        <CardDashboard
          title="Pacientes totales"
          data={`0`}
          icon={Calendar}
        />
      </div>

      {/* Sección de citas */}

      <div className="mt-5 w-full border rounded-md bg-gray-50">
        <div className="p-5 flex justify-between items-center">

          <div>
            <h3 className="font-bold">Citas de hoy</h3>
            <p className="text-sm text-gray-400">
              {totalAppointments} {totalAppointments === 1 ? 'cita' : 'citas'}
            </p>
          </div>

          <div>
            <a
              className="flex gap-1 items-center text-[#c0685c] font-bold text-sm"
              href="/citas"
            >
              Ver agenda <MoveRight size={15} />
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <AppointmentsDashboardTable />
        </div>
      </div>
    </>
  )
}