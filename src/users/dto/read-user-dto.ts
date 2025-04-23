import { User } from 'src/db/types/users.types';

export class ResultGetAll {
  total: number;
  page: number;
  list: User[];
}