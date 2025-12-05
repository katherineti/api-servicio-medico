import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { IJwtPayload } from './dto/jwt-payload.interface';
import { LogsService } from 'src/logs/logs.service';
import { IcustomerAccessPoint } from 'src/logs/interfaces/logs.interface';
export declare class AuthService {
    private usersService;
    private jwtService;
    private logsService;
    constructor(usersService: UsersService, jwtService: JwtService, logsService: LogsService);
    signIn(email: string, password: string, customerAccessPoint: IcustomerAccessPoint): Promise<{
        token: string;
    }>;
    signUp(signUp: SignupDto): Promise<{
        ok: boolean;
        status: number;
        description: string;
    }>;
    refreshAccessToken(payload_sesion_actual: IJwtPayload): Promise<{
        token: string;
    }>;
}
