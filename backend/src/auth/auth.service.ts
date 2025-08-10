import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterClientDto, AuthResponse } from './dto';
import { BaseResponseDto, ErrorDetail } from '../common/dto';
import { UserRole } from '../../generated/prisma';
import { randomBytes } from 'crypto';
import { ERROR_CODES, ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerClient(registerDto: RegisterClientDto): Promise<BaseResponseDto<AuthResponse>> {
    const errors: ErrorDetail[] = [];

    try {
      // Verificar username único
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: registerDto.username }
      });

      if (existingUsername) {
        errors.push({ 
          code: ERROR_CODES.USERNAME_EXISTS, 
          description: ERROR_MESSAGES.USERNAME_EXISTS 
        });
      }

      // Verificar sucursal existe
      const branch = await this.prisma.branch.findUnique({
        where: { id: registerDto.branchId },
        include: { business: { select: { name: true } } }
      });

      if (!branch) {
        errors.push({ 
          code: ERROR_CODES.BRANCH_NOT_EXISTS, 
          description: ERROR_MESSAGES.BRANCH_NOT_EXISTS 
        });
      }

      // Verificar email único en sucursal
      if (branch) {
        const existingUserBranch = await this.prisma.userBranch.findFirst({
          where: {
            email: registerDto.email,
            branchId: registerDto.branchId
          }
        });

        if (existingUserBranch) {
          errors.push({ 
            code: ERROR_CODES.EMAIL_EXISTS_IN_BRANCH, 
            description: ERROR_MESSAGES.EMAIL_EXISTS_IN_BRANCH 
          });
        }
      }

      if (errors.length > 0) {
        return BaseResponseDto.error(errors);
      }

      // Crear/obtener usuario
      let user = await this.prisma.user.findFirst({
        where: { username: registerDto.username }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: registerDto.email,
            username: registerDto.username,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: UserRole.CLIENT,
          }
        });
      }

      // Crear UserBranch
      const passwordHash = await bcrypt.hash(registerDto.password, 12);
      const apiKey = this.generateApiKey();

      const userBranch = await this.prisma.userBranch.create({
        data: {
          userId: user.id,
          branchId: registerDto.branchId,
          email: registerDto.email,
          passwordHash,
          apiKey,
        }
      });

      // Generar JWT
      const token = this.jwtService.sign({
        userId: user.id,
        userBranchId: userBranch.id,
        branchId: registerDto.branchId,
        role: user.role,
      });

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: registerDto.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          role: user.role,
        },
        branch: {
          id: branch!.id,
          name: branch!.name,
          businessName: branch!.business.name,
        },
        token,
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error en registerClient:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR, 
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  private generateApiKey(): string {
    return randomBytes(32).toString('hex');
  }
}
