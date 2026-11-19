export interface FilterOption {
    data: string;
    value: string;
}

/** Opciones del filtro de estado activo/inactivo (el backend espera ACTIVO | INACTIVO). */
export const ACTIVE_STATUS_OPTIONS: FilterOption[] = [
    { data: "Todos", value: "TODOS" },
    { data: "Activos", value: "ACTIVO" },
    { data: "Inactivos", value: "INACTIVO" },
];
