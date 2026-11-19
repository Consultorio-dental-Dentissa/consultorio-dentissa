import type { Request } from 'express';

export interface AuthUser {
  id: number;
  role: string;
  [key: string]: unknown;
}

/** Request de Express con el usuario autenticado que adjunta AuthGuard. */
export type AuthRequest = Request & { user?: AuthUser };
