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
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const {
        appointments,
        useGetAllAppointments,
        useCreateAppointment,
        useUpdateAppointment,
        isLoading,
        error
    } = useAppointments();

    const { servicesData, useGetAllServices } = useServices();
    const { patients, useGetAllPatients } = usePatients();

    useEffect(() => {
        setIsLoadingList(true);
        useGetAllAppointments().finally(() => setIsLoadingList(false));

        useGetAllPatients();
        useGetAllServices();
    }, []);

    /**
     * INDICACIÓN:
     * Los contadores se calculan del array de citas que ya está en
     * memoria (no de /appointments/count) para que se actualicen solos
     * en cuanto se crea o modifica una cita, sin depender de otra
     * petición al backend.
     */
    const statusCounts = useMemo(() => ({
        pending: appointments.filter(a => a.status === StatusAppointment.PENDIENTE).length,
        confirmed: appointments.filter(a => a.status === StatusAppointment.CONFIRMADA).length,
        rescheduled: appointments.filter(a => a.status === StatusAppointment.REPROGRAMADA).length,
        canceled: appointments.filter(a => a.status === StatusAppointment.CANCELADA).length,
    }), [appointments]);

    /**
     * INDICACIÓN:
     * El filtro de estatus ahora se aplica sobre el mismo array
     * (sin volver a pedirle al backend), para que siga reflejando
     * los cambios en tiempo real igual que los contadores de arriba.
     */
    const displayedAppointments = useMemo(() => {
        return selectedStatus === 'ALL'
            ? appointments
            : appointments.filter(a => a.status === selectedStatus);
    }, [appointments, selectedStatus]);


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

    const handleStatusFilterChange = (status: string) => {
        setSelectedStatus(status);
    }

    const appointmentStatus = useMemo(() => [
        ['ALL', 'Todos'],
        [StatusAppointment.PENDIENTE, 'Pendientes'],
        [StatusAppointment.CONFIRMADA, 'Confirmadas'],
        [StatusAppointment.REPROGRAMADA, 'Reprogramadas'],
        [StatusAppointment.COMPLETADA, 'Completadas'],
        [StatusAppointment.CANCELADA, 'Canceladas']
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
                    data={`${statusCounts.pending}`}
                />

                <CardDashboard
                    title="Confirmadas"
                    icon={Calendar}
                    data={`${statusCounts.confirmed}`}
                />

                <CardDashboard
                    title="Reprogramadas"
                    icon={Calendar}
                    data={`${statusCounts.rescheduled}`}
                />

                <CardDashboard
                    title="Canceladas"
                    icon={Calendar}
                    data={`${statusCounts.canceled}`}
                />
            </div>

            <div className="flex flex-row justify-between bg-white w-full px-5 py-3 mt-5 rounded-lg border">
                <div className="flex flex-row gap-5">
                    {
                        appointmentStatus.map(([key, label]) => (
                            <Button
                                key={key}
                                type="button"
                                variant={selectedStatus === key ? 'selectedGhost' : 'ghost'}
                                onClick={() => handleStatusFilterChange(key)}
                            >
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
                        {displayedAppointments.length === 1 ? `${displayedAppointments.length} cita` : `${displayedAppointments.length} citas`}
                    </div>
                </div>

                <div className="p-5">
                    {
                        isLoadingList ?
                            (
                                <div className="flex justify-center">
                                    <h2>Cargando...</h2>
                                </div>
                            )
                            :
                            (
                                <AppointmentList
                                    appointments={displayedAppointments}
                                    patiensList={patients.filter(p => p.status === true)}
                                    servicesList={servicesData.filter(s => s.status === true)}
                                    onUpdateAppointment={handleUpdatedAppointment}
                                    isSavingAppointment={isLoading}
                                />
                            )
                    }
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