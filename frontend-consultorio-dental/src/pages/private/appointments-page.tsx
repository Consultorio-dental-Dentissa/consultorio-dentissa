import { PageTitle } from "@/components/shared/page-title.component"
import { AppointmentList } from "@/features/appointments/components/appointment-list.component";
import { CreateAppointmentModal } from "@/features/appointments/components/create-appointment-modal.component";
import { AppointmentsTopCards } from "@/features/appointments/components/appointments-top-cards.component";
import { SelectFilterAppointment } from "@/features/appointments/components/select-filter-appointment.component";
import { SearchInput } from "@/components/shared/input.component";
import { Button } from "@/components/ui/button";
import { Calendars } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function AppointmentsPage() {

    const [status, setStatus] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");
    const debouncedSearch = useDebounce(search, 300);

    return (
        <>
            <div className="flex flex-row justify-between">
                <PageTitle
                    titulo="Panel de citas"
                    subtitulo="Aqui puedes manejar tus citas"
                />
            </div>

            <div className="flex gap-5 mt-5">
                <AppointmentsTopCards />
            </div>

            <div className="rounded-xl bg-white">
                <div className="flex flex-row justify-between w-full px-5 py-3 mt-5">
                    <div className="flex flex-row gap-2">
                        
                        <SelectFilterAppointment 
                            value={status}
                            onChange={setStatus}
                        />

                        <SearchInput 
                            placeholder="Buscar por nombre del paciente"
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />

                    </div>

                    <div className="flex flex-row gap-2">
                        <Button variant="outline">FIltrar por fecha <Calendars /> </Button>
                        <CreateAppointmentModal />
                    </div>
                </div>

                <div className="border-t p-5">
                    <AppointmentList
                        filters={{
                            status: status ?? undefined,
                            search: debouncedSearch
                        }}
                    />
                </div>
            </div>
        </>
    )
}