import { useEffect, useState, useMemo } from "react"
import { PageTitle } from "@/components/common/page-title.component"
import { Button } from "@/components/ui/button"
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentList } from "@/components/appointments/appointment-list.component";
import { Modal } from "@/components/common/modal.component";
import { CreateAppointmentForm } from "@/components/appointments/create-appointment-form.component";
import toast from "react-hot-toast";

import { useServices } from "@/hooks/use-services";
import { usePatients } from "@/hooks/use-patients";
import type { CreateAppointmentDto } from "@/types/api/request/create-appointment.dto";

export default function AppointmentsPage() {

    const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState(false);
    const { appointments, useGetAllAppointments, useCreateAppointment, error } = useAppointments();

    const { servicesData, useGetAllServices } = useServices();
    const { patients, useGetAllPatients } = usePatients();

    useEffect(() => {
        setIsLoadingList(true);
        useGetAllAppointments();
        setIsLoadingList(false);

        useGetAllPatients();
        useGetAllServices();
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
                    titulo="Modulo de citas"
                    subtitulo="Aqui puedes manejar tus citas"
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

            <div className="mt-5">
                {
                    isLoadingList ?
                        (
                            <div className="w-full bg-white p-5 rounded-lg flex justify-center">
                                <h2>Cargando...</h2>
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
                            <div>
                                <h3 className="text-xl font-medium">Citas de hoy</h3>
                                <AppointmentList appointments={appointments} />
                            </div>    
                        )
                }
            </div>

            <Modal
                open={openModal}
                title='Agendar Nueva Cita'
                onClose={() => setOpenModal(false)}
            >
                <CreateAppointmentForm
                    onSubmit={handleCreatedAppointment}
                    onCancel={() => setOpenModal(false)}
                    services={servicesData}
                    patients={patients}
                />
            </Modal>

        </>
    )
}