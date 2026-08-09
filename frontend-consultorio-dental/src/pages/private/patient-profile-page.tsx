import { PageTitle } from "@/components/shared/page-title.component"
import { useActualPatient } from "@/features/patients/hooks/use-patients";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppointmentSmallTable } from "@/features/appointments/components/appointment-small-table.component";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPhone } from "@/utils/formatters";
import { Spinner } from "@/components/ui/spinner";


export default function PatientProfile() {

    const {id} = useParams();
    const actualPatient = useActualPatient(Number(id));
    const actualPatientAppointments = useAppointments(`patient_id=${id}`);

    if (!id) {
        return null;
    }

    const totalAppointments = actualPatientAppointments.data ? actualPatientAppointments.data.length : 0;

    if (actualPatient.isLoading) {
        return <Spinner />
    }

    if (!actualPatient.data) {
        return <p>No se ha encontrado información de este paciente</p>
    }

    return (
        <>
            <PageTitle
                titulo="Perfil del paciente"
                subtitulo=""
            />

            <div className="bg-white p-5 rounded-lg flex flex-col">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-xl"> {`${actualPatient.data?.name} ${actualPatient.data?.lastname}`} </p>
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
                            <p className="font-medium">{actualPatient.data.email}</p>
                        </div>

                        <Separator orientation="vertical" />

                        <div>
                            <p className="font-base text-gray-500">Telefono:</p>
                            <p className="font-medium">{formatPhone(actualPatient.data.phone)}</p>
                        </div>

                        <Separator orientation="vertical" />

                        <div>
                            <p className="font-base text-gray-500">Telefono de emergencia:</p>
                            <p className="font-medium">{formatPhone(actualPatient.data.emergency_phone)}</p>
                        </div>

                        <Separator orientation="vertical" />

                        <div>
                            <p className="font-base text-gray-500">Fecha de nacimiento:</p>
                            <p className="font-medium">{formatDate(actualPatient.data.birth_date)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-5">

                    <h2 className="font-medium">Historial de consultas realizadas:</h2>
                    <div className="flex flex-col p-5 max-h-75 overflow-y-auto border border-gray-300 rounded-lg">
                        No hay consultas.
                    </div>

                    <h2 className="font-medium mt-5">Citas agendadas:</h2>
                    <div className={`flex justify-center w-full max-h-75 overflow-y-auto ${(actualPatientAppointments.isLoading || !totalAppointments) && 'p-5'}`}>
                        
                        <AppointmentSmallTable
                            patientId={Number(id)}
                        />
                        
                    </div>
                </div>
            </div>
        </>
    )
}