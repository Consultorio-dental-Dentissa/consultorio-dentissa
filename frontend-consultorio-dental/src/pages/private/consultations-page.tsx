import { useEffect, useState } from "react";
import { useConsultations } from "@/hooks/use-consultations";
import { PageTitle } from "@/components/common/page-title.component";
import { getConsultationsColumns } from "@/components/consultations/consultations-columns.component";
import { ConsultationInfoModal } from "@/components/consultations/consultation-info-modal.component";
import { DataTable } from "@/components/common/data-table.component";
import { CardDashboard } from "@/components/dashboard/card-dashboard.component";
import { Layers } from "lucide-react";
import type { Consultation } from "@/types/models/consultation";
import type { UpdateConsultationDto } from "@/types/api/request/update-consultation.dto";
import toast from "react-hot-toast";

export default function ConsultationPage() {

    const { consultations, useGetAllConsultations, useUpdateConsultation, isLoading, error } = useConsultations();

    const [openInfoModal, setOpenInfoModal] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

    useEffect(() => {
        useGetAllConsultations();

    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const handleViewConsultation = (consultation: Consultation) => {
        setSelectedConsultation(consultation);
        setOpenInfoModal(true);
    };

    const handleUpdateConsultation = async (id: number, dto: UpdateConsultationDto) => {
        const consultation = await useUpdateConsultation(id, dto);

        if (consultation) {
            toast.success('Consulta modificada exitosamente');
        }

        return consultation;
    };

    const consultationsTableColumns = getConsultationsColumns(handleViewConsultation);

    return (
        <div>

            <PageTitle
                titulo="Panel de consultas"
                subtitulo="Aqui puedes manejar tus consultas"
            />

            <div className="mt-3 flex flex-row gap-5">
                <CardDashboard
                    title="Numero de consultas"
                    icon={Layers}
                    data={consultations.length.toString()}
                />
            </div>


            <div className="bg-white rounded-xl mt-5 border">
                {
                    isLoading ?
                        (
                            <div className="bg-white rounded-lg p-5 flex justify-center">
                                <h2>Cargando...</h2>
                            </div>
                        )
                        :
                        !consultations.length ?
                            (
                                <div className="bg-white rounded-sm p-5 flex justify-center">
                                    <h2>No se encontrarón consultas.</h2>
                                </div>
                            )
                            :
                            (
                                <div>
                                    <div className="p-5 flex justify-between">
                                        <div className="w-full flex gap-1">

                                            <h2 className="font-bold text-lg">Consultas</h2>

                                        </div>

                                        {/* Imprimimos el numero de usuarios, con el abjetivo "usuario" en plural o singular dependiendo de su cantidad */}
                                        <div className="w-full flex justify-end text-gray-500 text-sm font-medium">
                                            {consultations.length === 1 ? `${consultations.length} consulta` : `${consultations.length} consultas`}
                                        </div>

                                    </div>

                                    <DataTable
                                        columns={consultationsTableColumns}
                                        data={consultations}
                                    />
                                </div>

                            )
                }
            </div>

            {
                selectedConsultation &&
                <ConsultationInfoModal
                    open={openInfoModal}
                    close={() => setOpenInfoModal(false)}
                    consultation={selectedConsultation}
                    onUpdateConsultation={handleUpdateConsultation}
                    isSaving={isLoading}
                />
            }
        </div>
    );

}
