import { Injectable, Logger } from "@nestjs/common"
import * as nodemailer from "nodemailer"

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter
  private readonly logger = new Logger(EmailService.name)

  constructor() {
    // Configuración del transporte SMTP
    // Asegúrate de tener estas variables en tu archivo .env
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com", // Ejemplo por defecto
      port: Number.parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:4200"}/reset-password/${token}`

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Servicio Médico" <noreply@serviciomedico.com>',
      to: to,
      subject: "Restablecimiento de Contraseña - Servicio Médico",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d47a1;">Restablecer Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña para acceder al Servicio Médico.</p>
          <p>Por favor, haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0d47a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
          </div>
          <p>Si no solicitaste este cambio, puedes ignorar este correo. El enlace expirará en 1 hora.</p>
          <p style="font-size: 12px; color: #666; margin-top: 30px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      this.logger.log(`Correo de restablecimiento enviado a ${to}`)
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${to}:`, error)
      throw new Error("No se pudo enviar el correo de restablecimiento")
    }
  }
}
