import type { ToothStatus } from "@/types/enums/tooth-status.enum";

export interface UpdateToothDto {
    status: ToothStatus;
    note?: string;
}
