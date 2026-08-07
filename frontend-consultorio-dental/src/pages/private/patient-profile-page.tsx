import { PageTitle } from "@/components/shared/page-title.component"
import { useEffect, useState } from "react"
import { usePatients } from "@/features/patients/hooks/use-patients"
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppointmentSmallTable } from "@/features/appointments/components/appointment-small-table.component";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPhone } from "@/utils/formatters";
import type { Patient } from "@/features/patients/types/patient.model";


export default function PatientProfile() {

    const { useGetPatientById } = usePatients();
    const [patient, setPatient] = useState<Patient | null>(null);
    const { id } = useParams();

    const appointments = useAppointments(`patient_id=${id}`);

    useEffect(() => {

        async function fetchData() {
            const patientInfo = await useGetPatientById(Number(id));
            patientInfo && setPatient(patientInfo);
        }

        fetchData();
    }, [])

    if (!patient) {
        return (
            <h2>No se ha encontrado información de este paciente</h2>
        )
    }

    return (
        <>
            <PageTitle
                titulo="Perfil del paciente"
                subtitulo=""
            />

            <div className="bg-white p-5 rounded-lg flex flex-col">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-xl"> {`${patient?.name} ${patient?.lastname}`} </p>
                    <Button variant="primary">Editar perfil</Button>
                </div>

                <div className="p-5 rounded-lg border border-gray-300 mt-5">

                    <div>
                        <p className="font-bold">Información general</p>
                        <p className="text-gray-500">Aqui estan todos los datos del paciente</p>
                    </div>

                    <div className="flex mt-5 justify-between">
                        <div>
                            <p className="font-base text-gray-500">Correo electronico:</p>
                            <p className="font-medium">{patient.email}</p>
                        </div>

                        <Separator orientation="vertical"/>

                        <div>
                            <p className="font-base text-gray-500">Telefono:</p>
                            <p className="font-medium">{formatPhone(patient.phone)}</p>
                        </div>

                        <Separator orientation="vertical"/>

                        <div>
                            <p className="font-base text-gray-500">Telefono de emergencia:</p>
                            <p className="font-medium">{formatPhone(patient.emergency_phone)}</p>
                        </div>

                        <Separator orientation="vertical"/>

                        <div>
                            <p className="font-base text-gray-500">Fecha de nacimiento:</p>
                            <p className="font-medium">{formatDate(patient.birth_date)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-5">

                    <h2 className="font-medium">Historial de consultas realizadas:</h2>
                    <div className="flex flex-col p-5 max-h-75 overflow-y-auto border border-gray-300 rounded-lg">
                        No hay consultas.
                    </div>

                    <h2 className="font-medium mt-5">Citas agendadas:</h2>
                    <div className="max-h-75 overflow-y-auto">
                        {
                            !appointments.data?.length ?
                                (
                                    <h2>No hay citas.</h2>
                                )

                                :

                                (
                                    <div className="bg-white rounded-md">
                                        <AppointmentSmallTable
                                            appointments={appointments.data.filter(a => a.status != STATUS_APPOINTMENT.CANCELADA)}
                                        />
                                    </div>
                                )
                        }
                    </div>
                </div>
            </div>
        </>
    )
}