import type { ToothStatus } from "@/types/enums/tooth-status.enum";

export interface ToothResponse {
    id: number;
    odontogram_id: number;
    number: number;
    status: ToothStatus;
    note: string | null;
    created_at: string;
    updated_at: string;
}
