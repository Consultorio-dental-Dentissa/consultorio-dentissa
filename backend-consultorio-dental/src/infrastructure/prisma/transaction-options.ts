/**
 * Opciones explicitas para las transacciones interactivas de Prisma.
 * - maxWait: cuanto espera una conexion libre del pool.
 * - timeout: duracion maxima de la transaccion (por defecto 5 s). Las
 *   transacciones con imagenes ya no escriben archivos dentro (solo filas y
 *   lock), asi que 15 s es holgado; al vencer Prisma lanza P2028 -> 503.
 */
export const TX_OPTIONS = { maxWait: 5000, timeout: 15000 } as const;
