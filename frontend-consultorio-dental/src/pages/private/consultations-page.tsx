import { useState } from "react";
import { PageTitle } from "../../components/common/page-title.component";

export default function ConsultationPage() {

    const [consultas, setConsultas] = useState<object | null>(null)

    return (
        <div>
            <PageTitle
                titulo="Panel de consultas"
                subtitulo="Aqui puedes manejar tus consultas"
            />
        </div>
    );

}