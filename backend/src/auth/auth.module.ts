import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService } from '../common/services/crypto.service';
import { BrandRegistrationService } from './services/brand-registration.service';
import { UserCreationService } from './services/user-creation.service';
import { BrandCreationService } from './services/brand-creation.service';
import { ColorPaletteService } from './services/color-palette.service';

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
  providers: [
    AuthService, 
    EmailService, 
    CryptoService,
    BrandRegistrationService,
    UserCreationService,
    BrandCreationService,
    ColorPaletteService
  ],
  exports: [
    AuthService, 
    EmailService, 
    CryptoService,
    BrandRegistrationService,
    UserCreationService,
    BrandCreationService,
    ColorPaletteService
  ],
})
export class AuthModule {}