import { Reflector } from '@nestjs/core';
import { Role } from '../../../modules/users/enums/rol.enum';

export const Roles = Reflector.createDecorator<Role[]>();
