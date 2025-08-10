import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService } from '../common/services/crypto.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { 
        expiresIn: '7d' // Token válido por 7 días
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, CryptoService],
  exports: [AuthService, EmailService, CryptoService],
})
export class AuthModule {}