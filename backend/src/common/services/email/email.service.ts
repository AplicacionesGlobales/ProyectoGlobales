// common/services/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templatePath = path.join(process.cwd(), 'src', 'common', 'email', 'templates');

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

  // Método genérico para cargar cualquier template
  loadTemplate(templateName: string, variables: { [key: string]: string }): string {
    try {
      const templateFile = path.join(this.templatePath, `${templateName}.html`);
      
      if (fs.existsSync(templateFile)) {
        let html = fs.readFileSync(templateFile, 'utf8');
        
        // Reemplazar todas las variables
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          html = html.replace(regex, value || '');
        });
        
        return html;
      }
      
      throw new Error(`Template ${templateName} no encontrado`);
    } catch (error) {
      console.error(`Error cargando template ${templateName}:`, error);
      throw error;
    }
  }
}