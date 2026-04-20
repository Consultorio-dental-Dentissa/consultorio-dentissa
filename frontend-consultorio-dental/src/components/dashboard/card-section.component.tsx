import { CardDashboard } from "./card-dashboard.component"

import { FiUser } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaLaptopMedical } from "react-icons/fa6";
import { IoGitNetworkOutline } from "react-icons/io5";

export function CardSection() {
    return (
        <div className="bg-white rounded-xl px-8 py-5 flex gap-5 flex-row justify-between mt-5">

            <CardDashboard title="Usuarios" backgroundColor="bg-blue-400" url="/usuarios"
            > <FiUser />
            </CardDashboard>

            <CardDashboard title="Pacientes" backgroundColor="bg-rose-500" url="/pacientes"
            > <IoGitNetworkOutline />

            </CardDashboard>
            <CardDashboard title="Citas" backgroundColor="bg-purple-600" url="/citas"
            > <FaRegCalendarAlt />
            </CardDashboard>

            <CardDashboard title="Consultas" backgroundColor="bg-zinc-500" url="/consultas"
            > <FaLaptopMedical />
            </CardDashboard>

        </div>
    )
}