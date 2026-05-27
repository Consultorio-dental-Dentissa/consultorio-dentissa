import { PageTitle } from "@/components/common/page-title.component"
import { useEffect, useState } from "react"
import { usePatients } from "@/hooks/use-patients"
import { useAppointments } from "@/hooks/use-appointments";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppointmentSmallTable } from "@/components/appointments/appointment-small-table.component";
import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import { Separator } from "@/components/ui/separator";
import { formatPhone } from "@/utils/formatters";
import type { Patient } from "@/types/models/patient";


export default function PatientProfile() {

    const { useGetPatientById } = usePatients();
    const { appointments, useGetAllAppointments } = useAppointments();
    const [patient, setPatient] = useState<Patient | null>(null);
    const { id } = useParams();

    useEffect(() => {

        async function fetchData() {
            const patientInfo = await useGetPatientById(Number(id));
            patientInfo && setPatient(patientInfo);

            useGetAllAppointments(`patient_id=${id}`);
        }

        fetchData()
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
                            <p className="font-medium">{patient.birth_date.toDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-5">

                    <h2 className="font-medium">Historial de consultas realizadas:</h2>
                    <div className="flex flex-col p-5 max-h-[300px] overflow-y-auto border border-gray-300 rounded-lg">
                        No hay consultas.
                    </div>

                    <h2 className="font-medium mt-5">Citas agendadas:</h2>
                    <div className="max-h-[300px] overflow-y-auto">
                        {
                            !appointments.length ?
                                (
                                    <h2>No hay citas.</h2>
                                )

                                :

                                (
                                    <div className="bg-white rounded-md">
                                        <AppointmentSmallTable
                                            appointments={appointments.filter(a => a.status != StatusAppointment.CANCELADA)}
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