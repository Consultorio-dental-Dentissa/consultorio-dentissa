import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../modules/users/enums/rol.enum';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint a los roles indicados.
 * Si se aplica a nivel de clase y de método, el método tiene prioridad.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
