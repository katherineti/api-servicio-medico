import { RolesSelect } from 'src/db/types/roles.types';

export class ResultGetAllRoles {
  total: number;
  page: number;
  list: RolesSelect[];
}