"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const users_service_1 = require("../users/users.service");
const argon2 = __importStar(require("argon2"));
const jwt_1 = require("@nestjs/jwt");
const logs_service_1 = require("../logs/logs.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, logsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.logsService = logsService;
    }
    async signIn(email, password, customerAccessPoint) {
        const user = await this.usersService.findOnByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException("Usuario no encontrado");
        }
        if (user.isActivate === false) {
            throw new common_1.NotFoundException('El usuario esta inactivo');
        }
        const authorized = await argon2.verify(user.password, password);
        if (!authorized) {
            throw new common_1.UnauthorizedException("Contraseña incorrecta");
        }
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role
        };
        common_1.Logger.debug("Payload ", JSON.stringify(payload));
        this.logsService.create({
            action: 'Inicio de sesión',
            userId: user.id,
            productId: null,
            ipAddress: customerAccessPoint.ip,
            hostname: customerAccessPoint.hostname
        });
        return {
            token: await this.jwtService.signAsync(payload, {
                secret: constants_1.jwtConstants.secret
            }),
        };
    }
    async signUp(signUp) {
        const userExist = await this.usersService.findOnByEmail(signUp.email);
        if (userExist) {
            throw new common_1.ConflictException('El correo ya existe.');
        }
        const userExistByCedula = await this.usersService.findOnByCedula(signUp.cedula);
        if (userExistByCedula) {
            throw new common_1.ConflictException('La cédula ya existe.');
        }
        await this.usersService.createUser(signUp);
        const objSaved = {
            ok: true,
            status: 201,
            description: 'Usuario registrado',
        };
        return objSaved;
    }
    async refreshAccessToken(payload_sesion_actual) {
        const user = await this.usersService.findOnByEmail(payload_sesion_actual.email);
        if (!user) {
            throw new common_1.UnauthorizedException("Usuario no encontrado");
        }
        if (user.isActivate === false) {
            throw new common_1.NotFoundException('El usuario esta inactivo');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role
        };
        console.log("payload actual recibido");
        console.log("refreshAccessToken: generando nuevo payload");
        return {
            token: await this.jwtService.signAsync(payload, {
                secret: constants_1.jwtConstants.secret
            }),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        logs_service_1.LogsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map