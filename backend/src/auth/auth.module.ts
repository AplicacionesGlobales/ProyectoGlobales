import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService } from '../common/services/crypto.service';
import { UserCreationService } from './services/user-creation.service';
import { ColorPaletteService } from './services/color-palette.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CommonModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: {
        expiresIn: '8h' // Access tokens: 8 horas
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    CryptoService,
    UserCreationService,
    ColorPaletteService,
    JwtStrategy
  ],
  exports: [
    AuthService,
    EmailService,
    CryptoService,
    UserCreationService,
    ColorPaletteService
  ],
})
export class AuthModule { }