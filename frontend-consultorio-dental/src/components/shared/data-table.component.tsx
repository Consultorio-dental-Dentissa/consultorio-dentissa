import type { ReactNode } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Pagination } from "@/components/shared/pagination.component";
import type { LucideIcon } from "lucide-react";

/** Metadatos opcionales de columna: clases para th/td (p. ej. ancho fijo). */
interface ColumnMeta {
    className?: string;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    caption: string;
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: LucideIcon;
    emptyAction?: ReactNode;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        onPageChange: (page: number) => void;
        noun?: string;
    };
    isFetching?: boolean;
    /** Si se indica, en pantallas pequeñas se muestran tarjetas en lugar de la tabla. */
    mobileCard?: (row: TData) => ReactNode;
}

/**
 * Tabla compartida con paginación de servidor. Maneja los tres estados
 * (cargando, error, vacío) para que todas las pantallas se comporten igual.
 */
export function DataTable<TData, TValue>({
    columns,
    data,
    caption,
    isLoading,
    error,
    onRetry,
    emptyTitle = "Sin resultados",
    emptyDescription = "No encontramos registros con los filtros actuales.",
    emptyIcon,
    emptyAction,
    pagination,
    isFetching,
    mobileCard,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    return (
        <div aria-busy={isLoading || isFetching}>
            {mobileCard && (
                <ul className="flex flex-col gap-3 p-4 md:hidden" aria-label={caption}>
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <li key={i}><Skeleton className="h-32 w-full rounded-xl" /></li>
                        ))
                        : table.getRowModel().rows.map((row) => (
                            <li key={row.id}>{mobileCard(row.original)}</li>
                        ))}
                </ul>
            )}

            <div className={mobileCard ? "hidden md:block" : undefined}>
            <Table aria-label={caption}>
                <caption className="sr-only">{caption}</caption>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className={(header.column.columnDef.meta as ColumnMeta | undefined)?.className}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className={isFetching && !isLoading ? "opacity-60 transition-opacity" : undefined}>
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, row) => (
                            <TableRow key={row} className="hover:bg-transparent">
                                {columns.map((_, col) => (
                                    <TableCell key={col}>
                                        <Skeleton className="h-4 w-full max-w-[160px]" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                        : table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className={(cell.column.columnDef.meta as ColumnMeta | undefined)?.className}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
            </div>

            {!isLoading && data.length === 0 && (
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    action={emptyAction}
                />
            )}

            {pagination && !isLoading && (
                <Pagination {...pagination} disabled={isFetching} />
            )}
        </div>
    );
}
