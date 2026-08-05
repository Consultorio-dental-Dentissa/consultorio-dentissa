import { useEffect, useState, useMemo } from "react"
import { PageTitle } from "@/components/common/page-title.component"
import { Button } from "@/components/ui/button"
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { AppointmentList } from "@/features/appointments/components/appointment-list.component";
import { Modal } from "@/components/common/modal.component";
import { CreateAppointmentForm } from "@/features/appointments/components/create-appointment-form.component";
import { CardDashboard } from "@/components/common/card-dashboard.component";
import { Calendar, CalendarCheck, Clock, CalendarSync, Calendars } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useServices } from "@/features/services/hooks/use-services";
import { usePatients } from "@/features/patients/hooks/use-patients";

import type { CreateAppointmentDto } from "@/features/appointments/types/create-appointment.dto";
import toast from "react-hot-toast";


export default function AppointmentsPage() {

    const [openModal, setOpenModal] = useState(false);

    const { appointments, useGetAllAppointments, useCreateAppointment, isLoading, isLoadingFetching, error } = useAppointments();
    const { servicesData, useGetAllServices } = useServices();
    const { patients, useGetAllPatients } = usePatients();

    useEffect(() => {
        useGetAllAppointments();
        useGetAllPatients();
        useGetAllServices();
    }, []);


    useEffect(() => {
        error && toast.error(error);
    }, [error]);



    const handleCreatedAppointment = async (dto: CreateAppointmentDto) => {

        const appointment = await useCreateAppointment(dto);

        if (appointment) {
            setOpenModal(false);
            toast.success('Cita agendada exitosamente');
            return;
        }
    }

    const appointmentStatus = useMemo(() => [
        ['ALL', 'Todos'],
        ['PENDIENTES', 'Pendientes'],
        ['CONFIRMADAS', 'Confirmadas'],
        ['CANCELADAS', 'Canceladas'],
        ['REPROGRAMADAS', 'Reprogramadas'],
        ['COMPLETADAS', 'Completadas']

    ], []);

    return (
        <>
            <div className="flex flex-row justify-between">
                <PageTitle
                    titulo="Panel de citas"
                    subtitulo="Aqui puedes manejar tus citas"
                />
            </div>

            <div className="flex gap-5 mt-5">
                <CardDashboard
                    title="Total de citas"
                    icon={Calendar}
                    data={appointments.length.toString()}
                />

                <CardDashboard
                    title="Pendientes"
                    icon={Clock}
                    data={appointments.filter(a => a.status === 'PENDIENTE').length.toString()}
                />

                <CardDashboard
                    title="Confirmadas"
                    icon={CalendarCheck}
                    data={appointments.filter(a => a.status === 'CONFIRMADA').length.toString()}
                />

                <CardDashboard
                    title="Reprogramadas"
                    icon={CalendarSync}
                    data={appointments.filter(a => a.status === 'REPROGRAMADA').length.toString()}                
                />
            </div>

            <div className="rounded-xl bg-white">
                <div className="flex flex-row justify-between w-full px-5 py-3 mt-5">
                    <div className="flex flex-row">
                        {
                            appointmentStatus.map(([key, label]) => (
                                <Button variant='ghost'>
                                    {label}
                                </Button>
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
                    {
                        isLoadingFetching ?
                            (
                                <div className="w-full bg-white p-5 rounded-lg flex justify-center">
                                    <Spinner />
                                </div>
                            )
                            :
                            !appointments.length ?
                                (
                                    <div className="w-full bg-white p-5 rounded-lg flex justify-center">
                                        <h2>No se han encontrado citas</h2>
                                    </div>
                                )
                                :
                                (
                                    <AppointmentList 
                                        appointments={appointments}
                                    />
                                )
                    }
                </div>
            </div>


            <Modal
                open={openModal}
                title='Agendar nueva cita'
                onClose={() => setOpenModal(false)}
            >
                <CreateAppointmentForm
                    onSubmit={handleCreatedAppointment}
                    onCancel={() => setOpenModal(false)}
                    isSaving={isLoading}
                    services={servicesData}
                    patients={patients}
                />
            </Modal>

        </>
    )
}