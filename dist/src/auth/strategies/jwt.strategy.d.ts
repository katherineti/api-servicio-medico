import { IJwtPayload } from '../dto/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(payload: IJwtPayload): Promise<IJwtPayload>;
    validateAdmin(payload: IJwtPayload): Promise<IJwtPayload>;
}
export {};
