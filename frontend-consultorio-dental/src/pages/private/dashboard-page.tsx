import { useAuth } from "../../context/auth-context-provider";
import { PageTitle } from "@/components/common/page-title.component";
import { CardSection } from "@/components/dashboard/card-section.component";

export default function DashboardPage() {

  const { user } = useAuth();

  return (
    <>
      <PageTitle
        titulo={`Bienvenid@, ${user && user.name}`}
        subtitulo="Aqui esta el resumen de tu consultorio dental"
      />

      <CardSection />

      {/* Aqui ira la seccion de las citas */}
      <section className="flex flex-col gap-5 mt-5">

        <div className="contenedor-seccion-titulo">
          <h3 className="font-bold text-xl">Citas pendientes</h3>
          <h4 className="font-base">Aqui puedes ver las citas que tienes pendientes para el dia de hoy</h4>
        </div>

        <div className="bg-white p-5 rounded-md h-[500px]">
          
        </div>

      </section>
    </>
  )
}