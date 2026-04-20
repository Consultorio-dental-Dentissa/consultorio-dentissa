import { useAuth } from "../../context/auth-context-provider";
import { PageTitle } from "@/components/common/page-title.component";
import { CardSection } from "@/components/dashboard/card-section.component";

export default function DashboardPage() {

  const { usuario } = useAuth();

  return (
    <div>

      <PageTitle
        titulo={`Bienvenid@, ${usuario && usuario.name}`}
        subtitulo="Aqui esta el resumen de tu consultorio dental"
      />

      <CardSection />

      {/* Aqui ira la seccion de las citas */}
      <section>
        <div className="contenedor-seccion-titulo">
          <h3>Citas pendientes</h3>
          <h4>Aqui puedes ver las citas que tienes pendientes para el dia de hoy</h4>
        </div>

        <div className="contenedor-citas-de-hoy">

        </div>
        
      </section>
    </div>
  )
}