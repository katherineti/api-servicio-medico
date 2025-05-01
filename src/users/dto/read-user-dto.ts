import { User } from 'src/db/types/users.types';

// export class ResultGetAll {
//   total: number;
//   page: number;
//   list: User[];
// }
export class ResultGetAll
 {
  total: number;
  page: number;
  list: Omit<IUser, 'password'>[];
}

export class IUser{
      id: number;
      name?: string;
      email: string;
      password?: string;
      roleId?: number;
      role: string;
      isActivate: boolean;
      createdAt?: Date;
      updatedAt?: Date;
}