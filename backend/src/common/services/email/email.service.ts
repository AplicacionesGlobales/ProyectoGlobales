// common/services/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Tu App" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log('Email enviado: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }

  generatePasswordResetEmailHTML(resetUrl: string, userName?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #0056b3;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Restablecer Contraseña</h2>
          </div>
          
          <p>Hola${userName ? ` ${userName}` : ''},</p>
          
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste tú quien realizó esta solicitud, puedes ignorar este email.</p>
          
          <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          </div>
          
          <p>O copia y pega el siguiente enlace en tu navegador:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad.
          </div>
          
          <div class="footer">
            <p>Si tienes problemas, contáctanos en soporte@tuapp.com</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}