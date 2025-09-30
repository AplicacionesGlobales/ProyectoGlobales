// src/common/guards/root-user.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RootUserGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Usuario no autenticado');
        }

        if (user.role !== 'ROOT') {
            throw new ForbiddenException('Solo usuarios ROOT pueden acceder a este recurso');
        }

        return true;
    }
}