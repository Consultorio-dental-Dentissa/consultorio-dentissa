import type { ApiResponse } from '@/types/api.response';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * Cliente HTTP central. Es la UNICA capa que conoce los códigos HTTP:
 * el resto de la app recibe un `ApiError` con un `code` semántico.
 */

export type ApiErrorCode =
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'conflict'
    | 'validation'
    | 'rate_limited'
    | 'unavailable'
    | 'network'
    | 'unexpected'
    | 'server';

export class ApiError extends Error {
    readonly code: ApiErrorCode;
    readonly details: string[];

    constructor(message: string, code: ApiErrorCode, details: string[] = []) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.details = details;
    }
}

export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

/** Endpoints donde un 401 significa "credenciales/token inválidos", no "sesión vencida". */
const NO_REFRESH_PATHS = [
    '/auth/login',
    '/auth/refresh',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
];

/** Configuración de petición con las marcas internas que usa el reintento tras refrescar la sesión. */
type TrackedConfig = AxiosRequestConfig & { _retry?: boolean; _sentAt?: number };

api.interceptors.request.use((config) => {
    (config as TrackedConfig)._sentAt = Date.now();
    return config;
});

const REFRESH_LOCK = 'auth-refresh';
const LAST_REFRESH_KEY = 'auth:last-refresh';

/** Último refresh exitoso de CUALQUIER pestaña (solo una marca de tiempo, nada sensible). */
function readLastRefresh(): number {
    try {
        return Number(window.localStorage.getItem(LAST_REFRESH_KEY)) || 0;
    } catch {
        return 0;
    }
}

function writeLastRefresh(timestamp: number) {
    try {
        window.localStorage.setItem(LAST_REFRESH_KEY, String(timestamp));
    } catch {
        // Sin localStorage solo se pierde la optimización entre pestañas.
    }
}

/** Serializa la tarea entre pestañas con Web Locks; sin soporte, se ejecuta directamente. */
function runExclusive<T>(task: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
        return navigator.locks.request(REFRESH_LOCK, task) as Promise<T>;
    }
    return task();
}

type RefreshOutcome = 'refreshed' | 'skipped';

/**
 * Evita que varias peticiones que expiran al mismo tiempo disparen cada una su
 * propia llamada a /auth/refresh: se agrupan dentro de la pestaña y se serializan
 * entre pestañas. Si otra pestaña ya refrescó después de que se envió la petición
 * fallida, se omite el refresh ("skipped") y basta con reintentar la petición.
 */
let refreshPromise: Promise<RefreshOutcome> | null = null;

function refreshAccessToken(requestSentAt: number, force = false): Promise<RefreshOutcome> {
    if (!refreshPromise) {
        refreshPromise = runExclusive<RefreshOutcome>(async () => {
            if (!force && readLastRefresh() > requestSentAt) return 'skipped';
            await api.post('/auth/refresh');
            writeLastRefresh(Date.now());
            return 'refreshed';
        }).finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

/**
 * Refresca la sesión. Solo si el refresh es rechazado (401) se avisa de que la
 * sesión terminó; un fallo de red, 429 o 503 se propaga sin cerrar la sesión.
 * `notifyExpired` es false para el /auth/me del arranque: "no hay sesión" no es una expiración.
 */
async function refreshOrExpire(requestSentAt: number, force: boolean, notifyExpired: boolean): Promise<RefreshOutcome> {
    try {
        return await refreshAccessToken(requestSentAt, force);
    } catch (error) {
        const apiError = toApiError(error);
        if (apiError.code === 'unauthorized' && notifyExpired) {
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        throw apiError;
    }
}

function codeFromStatus(status: number | undefined): ApiErrorCode {
    switch (status) {
        case 400:
        case 422:
            return 'validation';
        case 401:
            return 'unauthorized';
        case 403:
            return 'forbidden';
        case 404:
            return 'not_found';
        case 409:
            return 'conflict';
        case 429:
            return 'rate_limited';
        case 503:
            return 'unavailable';
        default:
            return status && status >= 500 ? 'server' : 'unexpected';
    }
}

const FALLBACK_MESSAGES: Record<ApiErrorCode, string> = {
    unauthorized: 'Tu sesión no es válida. Inicia sesión de nuevo.',
    forbidden: 'No tienes permiso para realizar esta acción.',
    not_found: 'No encontramos lo que buscas.',
    conflict: 'La acción entra en conflicto con el estado actual. Revisa los datos e inténtalo de nuevo.',
    validation: 'Revisa los datos ingresados.',
    rate_limited: 'Demasiados intentos. Espera un momento antes de volver a intentarlo.',
    unavailable: 'El servicio no está disponible por ahora. Inténtalo más tarde.',
    network: 'No pudimos comunicarnos con el servidor. Revisa tu conexión.',
    server: 'Ocurrió un error en el servidor. Inténtalo de nuevo en unos minutos.',
    unexpected: 'Ocurrió un error inesperado.',
};

function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (!axios.isAxiosError(error)) {
        return new ApiError(FALLBACK_MESSAGES.unexpected, 'unexpected');
    }

    if (!error.response) {
        return new ApiError(FALLBACK_MESSAGES.network, 'network');
    }

    const code = codeFromStatus(error.response.status);
    const body = error.response.data as { message?: unknown; errors?: unknown } | undefined;

    // 429: el mensaje del throttler viene en inglés; usamos uno propio.
    const backendMessage =
        code !== 'rate_limited' && typeof body?.message === 'string' && body.message.trim()
            ? body.message
            : FALLBACK_MESSAGES[code];

    const details = Array.isArray(body?.errors)
        ? body.errors.filter((item): item is string => typeof item === 'string')
        : [];

    return new ApiError(backendMessage, code, details);
}

api.interceptors.response.use(
    (response) => {
        const body = response.data as Partial<ApiResponse<unknown>> | undefined;

        // `data` puede ser legítimamente null/false/0: solo exigimos el envoltorio.
        if (body && typeof body === 'object' && body.success === true) {
            return body as never;
        }

        throw new ApiError(FALLBACK_MESSAGES.unexpected, 'unexpected');
    },
    async (error) => {
        if (axios.isAxiosError(error)) {
            const original = error.config as TrackedConfig | undefined;
            const path = original?.url ?? '';
            const canRefresh = !NO_REFRESH_PATHS.some((p) => path.includes(p));

            if (error.response?.status === 401 && original && !original._retry && canRefresh) {
                original._retry = true;
                const notifyExpired = !path.includes('/auth/me');
                const outcome = await refreshOrExpire(original._sentAt ?? Date.now(), false, notifyExpired);

                try {
                    return await (api(original) as Promise<AxiosResponse>);
                } catch (retryError) {
                    // Otra pestaña "ya refrescó" pero la petición sigue sin autorización: refresco real.
                    if (outcome === 'skipped' && retryError instanceof ApiError && retryError.code === 'unauthorized') {
                        await refreshOrExpire(Date.now(), true, notifyExpired);
                        return api(original);
                    }
                    throw retryError;
                }
            }
        }

        throw toApiError(error);
    },
);

export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return api.get(endpoint);
}

export async function post<T>(endpoint: string, data?: object): Promise<ApiResponse<T>> {
    return api.post(endpoint, data);
}

export async function put<T>(endpoint: string, data: object): Promise<ApiResponse<T>> {
    return api.put(endpoint, data);
}

export async function patch<T>(endpoint: string, data: object): Promise<ApiResponse<T>> {
    return api.patch(endpoint, data);
}

export async function deleteR<T>(endpoint: string): Promise<ApiResponse<T>> {
    return api.delete(endpoint);
}

/** multipart/form-data (axios fija el boundary automáticamente). */
export async function postForm<T>(endpoint: string, data: FormData): Promise<ApiResponse<T>> {
    return api.postForm(endpoint, data);
}

export async function putForm<T>(endpoint: string, data: FormData): Promise<ApiResponse<T>> {
    return api.putForm(endpoint, data);
}

/** URL absoluta de un recurso del backend (p. ej. imágenes de servicios). */
export function resolveApiUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
    return `${base}${path}`;
}

/**
 * Descarga un recurso binario protegido (p. ej. imágenes clínicas) enviando las
 * credenciales de sesión. Reintenta una vez tras renovar la sesión si recibe 401.
 */
export async function getBlob(endpoint: string): Promise<Blob> {
    const request = () =>
        axios.get<Blob>(endpoint, {
            baseURL: import.meta.env.VITE_API_URL,
            withCredentials: true,
            responseType: 'blob',
        });

    const sentAt = Date.now();

    try {
        return (await request()).data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Si el refresh falla con 401, refreshOrExpire ya avisa de la sesión expirada.
            await refreshOrExpire(sentAt, false, true);

            try {
                return (await request()).data;
            } catch (retryError) {
                if (axios.isAxiosError(retryError) && retryError.response?.status === 401) {
                    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
                }
                throw toApiError(retryError);
            }
        }
        throw toApiError(error);
    }
}
