import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { CreateUser, User } from 'src/db/types/users.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { IUser, ResultGetAll } from './dto/read-user-dto';
import { SearchUserDto } from './dto/search.user.dto';
export declare class UsersService {
    private db;
    private readonly logger;
    constructor(db: NeonDatabase);
    findOnByEmail(email: string): Promise<IUser>;
    findOnByCedula(cedulaUser: string): Promise<IUser>;
    getUserbyId(id: number): Promise<IUser>;
    createUser(createUser: CreateUser): Promise<any>;
    update(id: number, user: Partial<UpdateUserDto>): Promise<User>;
    delete(id: number): Promise<IUser>;
    getAll(filter: SearchUserDto, user: IJwtPayload): Promise<ResultGetAll>;
    validarAdmin(email: string): Promise<any>;
    getUsersbyRol(id: number): Promise<IUser[]>;
    countAllUsers(): Promise<{
        count: number;
    }>;
    totalUsersOfTheDay(): Promise<{
        count: number;
    }>;
    totalUsersOfMonth(): Promise<{
        count: number;
    }>;
}
