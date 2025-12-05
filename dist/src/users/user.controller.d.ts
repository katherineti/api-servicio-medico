import { User } from 'src/db/types/users.types';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IJwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { SearchUserDto } from './dto/search.user.dto';
import { IUser, ResultGetAll } from './dto/read-user-dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { AuthService } from 'src/auth/auth.service';
export declare class UserController {
    private readonly userService;
    private readonly authService;
    constructor(userService: UsersService, authService: AuthService);
    getUsers(body: SearchUserDto, user: IJwtPayload): Promise<ResultGetAll>;
    createAccount(signupDto: SignupDto): Promise<any>;
    updateUser(userId: number, user: UpdateUserDto): Promise<User>;
    deleteUser(id: number): Promise<IUser>;
    getUser(id: number): Promise<IUser>;
    getUserByRol(id: number): Promise<IUser[]>;
}
