import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  /** El SMTP esta configurado solo si existen host, usuario y contraseña. */
  isConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
    );
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const port = Number(process.env.SMTP_PORT) || 587;

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }

    return this.transporter;
  }

  /**
   * Envia el correo de recuperacion. Devuelve false (sin lanzar) si SMTP no esta
   * configurado o el envio falla; nunca registra el token ni el correo.
   */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn(
        'SMTP no configurado: no se envió el correo de recuperación de contraseña',
      );
      return false;
    }

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');
    const link = `${frontendUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
    const safeName = name.replace(/[<>&"']/g, '');

    try {
      await this.getTransporter().sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject: 'Recuperación de contraseña - Dentissa',
        text:
          `Hola ${safeName},\n\n` +
          `Recibimos una solicitud para restablecer tu contraseña. ` +
          `Usa el siguiente enlace (válido por 30 minutos y de un solo uso):\n\n${link}\n\n` +
          `Si no solicitaste este cambio, puedes ignorar este correo.`,
        html:
          `<p>Hola ${safeName},</p>` +
          `<p>Recibimos una solicitud para restablecer tu contraseña. ` +
          `Usa el siguiente enlace (válido por 30 minutos y de un solo uso):</p>` +
          `<p><a href="${link}">Restablecer contraseña</a></p>` +
          `<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>`,
      });
      return true;
    } catch {
      this.logger.error(
        'No se pudo enviar el correo de recuperación de contraseña',
      );
      return false;
    }
  }

  /**
   * Aviso al correo ANTERIOR tras un cambio de correo. Devuelve false (sin
   * lanzar y sin registrar el correo) si SMTP no esta configurado o falla.
   */
  async sendEmailChangedNotice(to: string, name: string): Promise<boolean> {
    if (!this.isConfigured()) return false;

    const safeName = name.replace(/[<>&"']/g, '');

    try {
      await this.getTransporter().sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject: 'Cambio de correo - Dentissa',
        text:
          `Hola ${safeName},

` +
          `El correo de tu cuenta fue modificado y se cerraron tus sesiones activas. ` +
          `Si no reconoces este cambio, contacta al consultorio de inmediato.`,
        html:
          `<p>Hola ${safeName},</p>` +
          `<p>El correo de tu cuenta fue modificado y se cerraron tus sesiones activas. ` +
          `Si no reconoces este cambio, contacta al consultorio de inmediato.</p>`,
      });
      return true;
    } catch {
      this.logger.error('No se pudo enviar el aviso de cambio de correo');
      return false;
    }
  }
}
