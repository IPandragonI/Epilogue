import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>('MAIL_HOST');
    const port = Number(this.configService.getOrThrow<string>('MAIL_PORT'));
    const secure = this.configService.getOrThrow<string>('MAIL_SECURE') === 'true';
    const user = this.configService.getOrThrow<string>('MAIL_USER');
    const pass = this.configService.getOrThrow<string>('MAIL_PASSWORD');

    this.fromEmail =
      this.configService.getOrThrow<string>('MAIL_FROM_EMAIL');
    this.fromName =
      this.configService.getOrThrow<string>('MAIL_FROM_NAME');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
  }

  async sendPasswordResetEmail(params: {
    to: string;
    firstname: string;
    resetUrl: string;
    expiresInMinutes: number;
  }): Promise<void> {
    const { to, firstname, resetUrl, expiresInMinutes } = params;

    const subject = 'Réinitialisation de votre mot de passe';
    const text = [
      `Bonjour ${firstname},`,
      '',
      'Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Epilogue.',
      `Pour choisir un nouveau mot de passe, ouvrez ce lien : ${resetUrl}`,
      '',
      `Ce lien expirera dans ${expiresInMinutes} minutes.`,
      "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <p>Bonjour ${firstname},</p>
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Epilogue.</p>
        <p>
          <a
            href="${resetUrl}"
            style="display: inline-block; padding: 12px 20px; background: #001B40; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;"
          >
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Ce lien expirera dans ${expiresInMinutes} minutes.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `${this.fromName} <${this.fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
  }
}
