import { TypesRoles } from 'src/db/enums/types-roles';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: TypesRoles[]) => import("@nestjs/common").CustomDecorator<string>;
