import { useEffect, useState, useMemo } from "react"
import { PageTitle } from "@/components/shared/page-title.component"
import { Button } from "@/components/ui/button"
import { useAppointments, useCreateAppointment } from "@/features/appointments/hooks/use-appointments";
import { AppointmentList } from "@/features/appointments/components/appointment-list.component";
import { Modal } from "@/components/shared/modal.component";
import { CreateAppointmentForm } from "@/features/appointments/components/create-appointment-form.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { Calendar, CalendarCheck, Clock, Calendars } from "lucide-react";
import { useServices } from "@/features/services/hooks/use-services";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { formatFirstLetterUppercase } from "@/utils/formatters";

import type { CreateAppointmentDto } from "@/features/appointments/types/create-appointment.dto";
import toast from "react-hot-toast";


export default function AppointmentsPage() {

    const [openModal, setOpenModal] = useState(false);

    const appointments = useAppointments();
    const createAppointmentMutation = useCreateAppointment();

    const services = useServices();
    const { patients, useGetAllPatients } = usePatients();

    useEffect(() => {
        useGetAllPatients();
    }, []);

    const handleCreatedAppointment = async (appointmentDto: CreateAppointmentDto) => {
        createAppointmentMutation.mutate(appointmentDto, {
            onSuccess: () => {
                toast.success('Se agendó una nueva cita');
                setOpenModal(false);
            },
            onError: (error) => toast.error(error.message)
        });
    }

    const cardDashboardData = useMemo(() => [
        {
            title: 'Total de citas',
            icon: Calendar,
            data: (appointments.data ? appointments.data.length : 0).toString()
        },
        {
            title: 'Pendientes',
            icon: Clock,
            data: (appointments.data ? 
                appointments.data.filter(a => a.status === STATUS_APPOINTMENT.PENDIENTE).length : 0).toString()
        },
        {
            title: 'Confirmadas',
            icon: CalendarCheck,
            data: (appointments.data ? 
                appointments.data.filter(a => a.status === STATUS_APPOINTMENT.CONFIRMADA).length : 0).toString()
        },
        {
            title: 'Reprogramadas',
            icon: Calendar,
            data: (appointments.data ? 
                appointments.data.filter(a => a.status === STATUS_APPOINTMENT.REPROGRAMADA).length : 0).toString()
        }
    ], [appointments.data]);

    return (
        <>
            <div className="flex flex-row justify-between">
                <PageTitle
                    titulo="Panel de citas"
                    subtitulo="Aqui puedes manejar tus citas"
                />
            </div>

            <div className="flex gap-5 mt-5">
                {cardDashboardData.map(data => (
                    <CardDashboard 
                        title={data.title}
                        icon={data.icon}
                        data={data.data}
                    />
                ))}
            </div>

            <div className="rounded-xl bg-white">
                <div className="flex flex-row justify-between w-full px-5 py-3 mt-5">
                    <div className="flex flex-row">
                        {
                            Object.keys(STATUS_APPOINTMENT).map(data => (
                                <Button variant="ghost">{formatFirstLetterUppercase(data)}</Button>
                            ))
                        }
                    </div>

                    {/* Aqui deben ir los botones que decidan si se verá la vista de un dia o la vista de todo el mes */}
                    <div className="flex gap-3">
                        <Button variant="outline">Mes</Button>
                        <Button variant="outline">Dia</Button>
                    </div>

                    <div className="flex flex-row gap-2">
                        <Button variant="outline">FIltrar por fecha <Calendars /> </Button>
                        <Button variant="primary" onClick={() => setOpenModal(true)}>Agendar cita</Button>
                    </div>
                </div>

                <div className="border-t p-5">   
                    <AppointmentList />
                </div>
            </div>

            {services.data && (
                <Modal
                open={openModal}
                title='Agendar nueva cita'
                onClose={() => setOpenModal(false)}>
                    <CreateAppointmentForm
                        onSubmit={handleCreatedAppointment}
                        onCancel={() => setOpenModal(false)}
                        isSaving={createAppointmentMutation.isPending}
                        services={services.data}
                        patients={patients}
                    />
                </Modal>
            )}
        </>
    )
}