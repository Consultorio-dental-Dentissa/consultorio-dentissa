import { PageTitle } from "@/components/common/page-title.component"
import { useEffect, useState } from "react"
import { usePatients } from "@/hooks/use-patients"
import { useAppointments } from "@/hooks/use-appointments";
import { useOdontogram } from "@/hooks/use-odontogram";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ActiveSpan } from "@/components/common/span.component";
import { AppointmentSmallTable } from "@/components/appointments/appointment-small-table.component";
import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import { formatDate, formatPhone } from "@/utils/formatters";
import { Mail, Phone, PhoneCall, CalendarDays, MapPin } from "lucide-react";
import type { Patient } from "@/types/models/patient";
import type { Tooth } from "@/types/models/tooth";
import type { UpdateToothDto } from "@/types/api/request/update-tooth.dto";
import { OdontogramChart } from "@/components/odontogram/odontogram-chart.component";
import { ToothInfoModal } from "@/components/odontogram/tooth-info-modal.component";
import toast from "react-hot-toast";


export default function PatientProfile() {

    const { useGetPatientById } = usePatients();
    const { appointments, useGetAllAppointments } = useAppointments();
    const { odontogram, useGetOdontogramByPatientId, useUpdateTooth, isLoading: isSavingTooth } = useOdontogram();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [selectedTooth, setSelectedTooth] = useState<Tooth | null>(null);
    const [openToothModal, setOpenToothModal] = useState(false);
    const { id } = useParams();

    useEffect(() => {

        async function fetchData() {
            const patientInfo = await useGetPatientById(Number(id));
            patientInfo && setPatient(patientInfo);

            useGetAllAppointments(`patient_id=${id}`);
            useGetOdontogramByPatientId(Number(id));
        }

        fetchData()
    }, [])

    const handleSelectTooth = (tooth: Tooth) => {
        setSelectedTooth(tooth);
        setOpenToothModal(true);
    };

    const handleUpdateTooth = async (toothId: number, dto: UpdateToothDto) => {
        const tooth = await useUpdateTooth(toothId, dto);

        if (tooth) {
            toast.success('Diente actualizado exitosamente');
        }

        return tooth;
    };

    if (!patient) {
        return (
            <h2>No se ha encontrado información de este paciente</h2>
        )
    }

    const initials = `${patient.name.charAt(0)}${patient.lastname.charAt(0)}`.toUpperCase();
    const activeAppointments = appointments.filter(a => a.status != StatusAppointment.CANCELADA);

    return (
        <>
            <PageTitle
                titulo="Perfil del paciente"
                subtitulo="Información general, historial clínico y citas del paciente"
            />

            <div className="flex flex-col gap-5 mt-3">

                <Card>
                    <CardContent className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg font-semibold text-stone-600">
                                {initials}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-semibold leading-tight text-stone-900">
                                        {`${patient.name} ${patient.lastname}`}
                                    </p>
                                    <ActiveSpan status={patient.status} />
                                </div>
                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                            </div>
                        </div>

                        <Button variant="primary">Editar perfil</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Información general</CardTitle>
                        <CardDescription>Datos personales y de contacto del paciente</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-stone-100 bg-stone-50/70 p-4 md:grid-cols-4">

                            <div className="flex items-start gap-2.5">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-muted-foreground">Correo electrónico</p>
                                    <p className="text-sm font-medium text-stone-900">{patient.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-muted-foreground">Teléfono</p>
                                    <p className="text-sm font-medium text-stone-900">{formatPhone(patient.phone)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-muted-foreground">Teléfono de emergencia</p>
                                    <p className="text-sm font-medium text-stone-900">{formatPhone(patient.emergency_phone)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-muted-foreground">Fecha de nacimiento</p>
                                    <p className="text-sm font-medium text-stone-900">{formatDate(patient.birth_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 col-span-2 md:col-span-4">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-muted-foreground">Dirección</p>
                                    <p className="text-sm font-medium text-stone-900">{patient.address}</p>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de consultas</CardTitle>
                            <CardDescription>Consultas registradas para este paciente</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-col items-center justify-center rounded-lg border border-stone-100 bg-stone-50/70 p-5 text-sm text-muted-foreground max-h-75 overflow-y-auto">
                                No hay consultas.
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Citas agendadas</CardTitle>
                            <CardDescription>
                                {activeAppointments.length === 1 ? '1 cita programada' : `${activeAppointments.length} citas programadas`}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="max-h-75 overflow-y-auto">
                                {
                                    !activeAppointments.length ?
                                        (
                                            <div className="flex flex-col items-center justify-center rounded-lg border border-stone-100 bg-stone-50/70 p-5 text-sm text-muted-foreground">
                                                No hay citas.
                                            </div>
                                        )

                                        :

                                        (
                                            <AppointmentSmallTable
                                                appointments={activeAppointments}
                                            />
                                        )
                                }
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos clínicos</CardTitle>
                        <CardDescription>Odontograma — haz clic en un diente para ver o modificar su estado</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {
                            !odontogram ?
                                (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-stone-100 bg-stone-50/70 p-5 text-sm text-muted-foreground">
                                        No hay odontograma registrado.
                                    </div>
                                )

                                :

                                (
                                    <OdontogramChart
                                        teeth={odontogram.teeth}
                                        onSelectTooth={handleSelectTooth}
                                    />
                                )
                        }
                    </CardContent>
                </Card>

            </div>

            {
                selectedTooth &&
                <ToothInfoModal
                    open={openToothModal}
                    close={() => setOpenToothModal(false)}
                    tooth={selectedTooth}
                    onUpdateTooth={handleUpdateTooth}
                    isSaving={isSavingTooth}
                />
            }
        </>
    )
}
