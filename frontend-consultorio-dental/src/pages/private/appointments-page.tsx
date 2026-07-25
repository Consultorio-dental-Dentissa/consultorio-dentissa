import { useEffect, useState, useMemo } from "react"
import { PageTitle } from "@/components/common/page-title.component"
import { Button } from "@/components/ui/button"
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentList } from "@/components/appointments/appointment-list.component";
import { Modal } from "@/components/common/modal.component";
import { CreateAppointmentForm } from "@/components/appointments/create-appointment-form.component";
import toast from "react-hot-toast";
import { CardDashboard } from "@/components/dashboard/card-dashboard.component";
import { Input } from "@/components/ui/input";

import { useServices } from "@/hooks/use-services";
import { usePatients } from "@/hooks/use-patients";
import type { CreateAppointmentDto } from "@/types/api/request/create-appointment.dto";
import type { UpdateAppointmentDto } from "@/types/api/request/update-appointment.dto";
import { Calendar } from "lucide-react";
import { StatusAppointment } from "@/types/enums/status-appointment.enum";

export default function AppointmentsPage() {

    const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState(false);
    const {
        appointments,
        useGetAllAppointments,
        useGetAppointmentsCount,
        useCreateAppointment,
        useUpdateAppointment,
        isLoading,
        error
    } = useAppointments();

    const { servicesData, useGetAllServices } = useServices();
    const { patients, useGetAllPatients } = usePatients();

    const [totalAppointments, setTotalAppointments] = useState(0);
    const [pendingAppointments, setPendingAppointments] = useState(0);
    const [confirmedAppointments, setConfirmedAppointments] = useState(0);
    const [canceledAppointments, setCanceledAppointments] = useState(0);
    const [rescheduledAppointments, setRescheduledAppointments] = useState(0);


    useEffect(() => {
        setIsLoadingList(true);
        useGetAllAppointments();
        setIsLoadingList(false);

        useGetAllPatients();
        useGetAllServices();

        useGetAppointmentsCount().then(count => {
            if (count !== undefined) setTotalAppointments(count);
        });

        useGetAppointmentsCount(`status=${StatusAppointment.PENDIENTE}`).then(count => {
            if (count !== undefined) setPendingAppointments(count);
        });

        useGetAppointmentsCount(`status=${StatusAppointment.CONFIRMADA}`).then(count => {
            if (count !== undefined) setConfirmedAppointments(count);
        });

        useGetAppointmentsCount(`status=${StatusAppointment.CANCELADA}`).then(count => {
            if (count !== undefined) setCanceledAppointments(count);
        });

        useGetAppointmentsCount(`status=${StatusAppointment.REPROGRAMADA}`).then(count => {
            if (count !== undefined) setRescheduledAppointments(count);
        });

    }, []);


    useEffect(() => {
        error && toast.error(error);
    }, [error]);


    /**
     * FUNCION:
     * Funcion para hacer que la vista reaccione
     * al intentar agregar un nuevo usuario
     */

    const handleCreatedAppointment = async (dto: CreateAppointmentDto) => {

        const appointment = await useCreateAppointment(dto);

        if (appointment) {
            setOpenModal(false);
            toast.success('Cita agendada exitosamente');
            return;
        }
    }

    const handleUpdatedAppointment = async (id: number, dto: UpdateAppointmentDto) => {

        const appointment = await useUpdateAppointment(id, dto);

        if (appointment) {
            toast.success('Cita modificada exitosamente');
        }

        return appointment;
    }

    const appointmentStatus = useMemo(() => [
        ['ALL', 'Todos'],
        ['PENDIENTES', 'Pendientes'],
        ['CONFIRMADAS', 'Confirmadas'],
        ['CANCELADAS', 'Canceladas']
    ], []);

    return (
        <>
            <div className="flex flex-row justify-between">
                <PageTitle
                    titulo="Panel de citas"
                    subtitulo="Aqui puedes manejar tus citas"
                />
            </div>

            <div className="flex w-full gap-3 mt-5">
                <CardDashboard
                    title="Pendientes"
                    icon={Calendar}
                    data={`${pendingAppointments}`}
                />

                <CardDashboard
                    title="Confirmadas"
                    icon={Calendar}
                    data={`${confirmedAppointments}`}
                />

                <CardDashboard
                    title="Reprogramadas"
                    icon={Calendar}
                    data={`${rescheduledAppointments}`}
                />

                <CardDashboard
                    title="Canceladas"
                    icon={Calendar}
                    data={`${canceledAppointments}`}
                />
            </div>

            <div className="flex flex-row justify-between bg-white w-full px-5 py-3 mt-5 rounded-md shadow-card">
                <div className="flex flex-row gap-5">
                    {
                        appointmentStatus.map(([key, label]) => (
                            <Button variant='ghost'>
                                {label}
                            </Button>
                        ))
                    }
                </div>

                <div className="flex flex-row gap-2">
                    <Button variant="outline">Filtros</Button>
                    <Button variant="primary" onClick={() => setOpenModal(true)}>Agendar cita</Button>
                </div>
            </div>




            <div className="bg-white rounded-xl mt-1 border">
                <div className="p-5 flex justify-between border-b">
                    <div className="w-full flex gap-1">

                        <Input
                            className="w-[40%]"
                            placeholder="Buscar por nombre, correo o telefono"
                        />

                    </div>
                    <div className="w-full flex justify-end text-gray-500 text-sm font-medium">
                        {totalAppointments === 1 ? `${totalAppointments} cita` : `${totalAppointments} citas`}
                    </div>
                </div>
                
                <div className="p-5">
                    <AppointmentList
                        appointments={appointments}
                        patiensList={patients.filter(p => p.status === true)}
                        servicesList={servicesData.filter(s => s.status === true)}
                        onUpdateAppointment={handleUpdatedAppointment}
                        isSavingAppointment={isLoading}
                    />
                </div>
            </div>

            <Modal
                open={openModal}
                title='Agendar Nueva Cita'
                onClose={() => setOpenModal(false)}
            >
                <CreateAppointmentForm
                    onSubmit={handleCreatedAppointment}
                    onCancel={() => setOpenModal(false)}
                    isSaving={isLoading}
                    patients={patients.filter(p => p.status === true)}
                    services={servicesData.filter(s => s.status === true)}
                />
            </Modal>

        </>
    )
}