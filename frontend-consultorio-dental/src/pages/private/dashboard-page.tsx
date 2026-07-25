import { PageTitle } from "@/components/common/page-title.component";
import { formatDate, toLocalDateString } from "@/utils/formatters";
import { Calendar, SquarePlus, Users, MoveRight } from "lucide-react";

import { CardDashboard } from "@/components/dashboard/card-dashboard.component";

import { useAppointments } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { AppointmentsDashboardTable } from "@/components/appointments/appointment-dashboard-table.component";
import { useEffect, useState } from "react";


export default function DashboardPage() {

  const date = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(date.getDate() + 1);

  const { appointments, useGetAllAppointments, useGetAppointmentsCount } = useAppointments();
  const { useGetPatientsCount } = usePatients();
  const [tomorrowAppointmentCount, setTomorrowAppointmentCount] = useState(0);
  const [activePatientsCount, setActivePatientsCount] = useState(0);
  const [totalPatientsCount, setTotalPatientsCount] = useState(0);


  useEffect(() => {

    useGetAllAppointments(`date=${toLocalDateString(date)}`);

    useGetAppointmentsCount(`date=${toLocalDateString(tomorrow)}`).then(count => {
      if (count !== undefined) setTomorrowAppointmentCount(count);
    });

    useGetPatientsCount('status=true').then(count => {
      if (count !== undefined) setActivePatientsCount(count);
    });

    useGetPatientsCount().then(count => {
      if (count !== undefined) setTotalPatientsCount(count);
    })
  }, []);


  return (
    <>
      <PageTitle
        titulo="Panel general"
        subtitulo={`Resumen del consultorio ${formatDate(date)}`}
      />


      <div className="flex w-full mt-3 gap-5">

        <CardDashboard
          title="Citas de hoy"
          data={appointments.length.toString()}
          icon={Calendar}
        />

        <CardDashboard
          title="Citas de mañana"
          data={`${tomorrowAppointmentCount}`}
          icon={SquarePlus}
        />
        <CardDashboard
          title="Pacientes activos"
          data={`${activePatientsCount}`}
          icon={Users}
        />
        <CardDashboard
          title="Pacientes totales"
          data={`${totalPatientsCount}`}
          icon={Calendar}
        />
      </div>

      {/* Sección de citas */}

      <div className="mt-5 w-full border rounded-md bg-gray-50">
        <div className="p-5 flex justify-between items-center">

          <div>
            <h3 className="font-bold">Citas de hoy</h3>
            <p className="text-sm text-gray-400">
              {appointments.length === 1 ? `${appointments.length} cita programada` : `${appointments.length} citas programadas`}
            </p>
          </div>

          <div>
            <a className="flex gap-1 items-center text-[#c0685c] font-bold text-sm" href="/citas">
              Ver agenda <MoveRight size={15}/>
            </a>
          </div>   
        </div>

        <AppointmentsDashboardTable appointments={appointments}/>

      </div>
    </>
  )
}