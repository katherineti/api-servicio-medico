import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignupDto } from './dto/signup.dto';
import { IJwtPayload } from './dto/jwt-payload.interface';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(signInDto: SignInDto, clienteIp: string, req: Request): Promise<{
        token: string;
    }>;
    signUp(signupDto: SignupDto): Promise<{
        ok: boolean;
        status: number;
        description: string;
    }>;
    refreshToken(user: IJwtPayload): Promise<{
        token: string;
    }>;
}
