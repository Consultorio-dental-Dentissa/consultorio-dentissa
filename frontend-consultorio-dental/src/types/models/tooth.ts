import type { ToothStatus } from "@/types/enums/tooth-status.enum";

export interface Tooth {
    id: number;
    odontogram_id: number;
    number: number;
    status: ToothStatus;
    note: string | null;
    created_at: Date;
    updated_at: Date;
}
