import { Injectable, UnauthorizedException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { jwtConstants } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { IJwtPayload } from './dto/jwt-payload.interface';
import { TypesRoles } from 'src/db/enums/types-roles';
import { LogsService } from 'src/logs/logs.service';
import { IcustomerAccessPoint } from 'src/logs/interfaces/logs.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  
  private resetTokens: Map<string, { userId: number; expiresAt: Date }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private logsService: LogsService,
    private emailService: EmailService
  ) {}

    async signIn(email:string, password: string, customerAccessPoint: IcustomerAccessPoint): Promise<{ token: string }> {
        
      const user = await this.usersService.findOnByEmail(email);

      if(!user){
          throw new UnauthorizedException("Usuario no encontrado"); 
      }

      if (user.isActivate === false) {
        throw new NotFoundException('El usuario esta inactivo');
      }

      const authorized = await argon2.verify( user.password , password ); //devuelve true o false

      if( !authorized ){
          throw new UnauthorizedException("Contraseña incorrecta");
      }

      const payload: IJwtPayload = { 
        sub: user.id, 
        email: user.email,
        name: user.name || '',
        role: user.role as TypesRoles
      };
      Logger.debug("Payload " ,JSON.stringify(payload));

      this.logsService.create({
        action: 'Inicio de sesión',
        userId: user.id,
        productId: null,
        ipAddress:customerAccessPoint.ip,
        hostname:customerAccessPoint.hostname
      });

      return {
        token: await this.jwtService.signAsync(payload, {
          secret: jwtConstants.secret
        }),
      };
    }

    async signUp(signUp:SignupDto): Promise<{
      ok: boolean,
      status: number,
      description: string,
    }> {

      const userExist = await this.usersService.findOnByEmail(signUp.email);

      if (userExist) {
        throw new ConflictException('El correo ya existe.');
      }

      const userExistByCedula = await this.usersService.findOnByCedula(signUp.cedula);

      if (userExistByCedula) {
        throw new ConflictException('La cédula ya existe.');
      }
          
      await this.usersService.createUser(signUp);

      const objSaved = {
        ok: true,
        status: 201,
        description: 'Usuario registrado',
      };
  
      return objSaved;
    }

  // Nuevo método para refrescar el token
  async refreshAccessToken(payload_sesion_actual: IJwtPayload): Promise<{ token: string }> {

      const user = await this.usersService.findOnByEmail(payload_sesion_actual.email);

      if(!user){
          throw new UnauthorizedException("Usuario no encontrado"); 
      }

      if (user.isActivate === false) {
        throw new NotFoundException('El usuario esta inactivo');
      }

      const payload: IJwtPayload = { 
        sub: user.id, 
        email: user.email,
        name: user.name || '',
        role: user.role as TypesRoles
      };

    // console.log("payload actual recibido",payload_sesion_actual);
    // console.log("refreshAccessToken: generando nuevo payload",payload)
    console.log("payload actual recibido");
    console.log("refreshAccessToken: generando nuevo payload");

    return {
      token: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret
      }),
    }
  }

  // para cambio de contraseña - logueado
async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto
  ): Promise<{ ok: boolean; message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validar que las contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('Las contraseñas nuevas no coinciden');
    }

    // Validar que la nueva contraseña sea diferente a la actual
    const user = await this.usersService.getUserbyId(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await argon2.verify(user.password, currentPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await argon2.hash(newPassword);

    // Actualizar la contraseña en la base de datos
    await this.usersService.updateUserPassword(userId, hashedPassword);

    Logger.debug(`Contraseña actualizada para usuario ID: ${userId}`);

    return {
      ok: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }

//restablecimiento de contraseña - no logueado
  private generateResetToken(): string {
    const crypto = require("crypto")
    return crypto.randomBytes(32).toString("hex")
  }

  async forgotPassword(email: string): Promise<{
    ok: boolean
    message: string
    token?: string // Solo para desarrollo, en producción se enviaría por email
  }> {
    const user = await this.usersService.findOnByEmail(email)

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user || user.isActivate === false) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Por seguridad, no revelar si el email existe o no
      return {
        ok: true,
        message: "Si el correo existe, recibirás un enlace de restablecimiento",
      }
    }

    // Generar token único
    const resetToken = this.generateResetToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token válido por 1 hora

    // Guardar el token con su expiración
    this.resetTokens.set(resetToken, {
      userId: user.id,
      expiresAt,
    })

    Logger.debug(`Token de restablecimiento generado para usuario: ${user.email}`)

    await this.emailService.sendResetPasswordEmail(user.email, resetToken)

    // Retornamos mensaje de éxito (sin el token en producción)
    return {
      ok: true,
      message: "Si el correo existe, recibirás un enlace de restablecimiento",
      // token: resetToken, // Comentado para producción, descomentar solo si es necesario para pruebas manuales sin email
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ ok: boolean; message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException("Las contraseñas no coinciden")
    }

    // Verificar si el token existe
    const resetData = this.resetTokens.get(token)

    if (!resetData) {
      throw new UnauthorizedException("Token inválido o expirado")
    }

    // Verificar si el token ha expirado
    if (new Date() > resetData.expiresAt) {
      this.resetTokens.delete(token)
      throw new UnauthorizedException("Token expirado")
    }

    // Obtener el usuario
    const user = await this.usersService.getUserbyId(resetData.userId)

    if (!user || user.isActivate === false) {
      this.resetTokens.delete(token)
      throw new NotFoundException("Usuario no encontrado o inactivo")
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await argon2.verify(
      (await this.usersService.findOnByEmail(user.email)).password,
      newPassword,
    )

    if (isSamePassword) {
      throw new UnauthorizedException("La nueva contraseña debe ser diferente a la actual")
    }

    // Hash de la nueva contraseña
    const hashedPassword = await argon2.hash(newPassword)

    // Actualizar la contraseña
    await this.usersService.updateUserPassword(resetData.userId, hashedPassword)

    // Eliminar el token usado
    this.resetTokens.delete(token)

    Logger.debug(`Contraseña restablecida exitosamente para usuario ID: ${resetData.userId}`)

    return {
      ok: true,
      message: "Contraseña restablecida exitosamente",
    }
  }

  cleanupExpiredTokens(): void {
    const now = new Date()
    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token)
      }
    }
  }

}