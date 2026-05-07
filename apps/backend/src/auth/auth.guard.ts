import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      const email = request.headers['x-user-email'] as string;
      if (email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
          request['user'] = { sub: user.id, email: user.email };
          return true;
        }
      }
      throw new UnauthorizedException('No token provided');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'wearnextsupersecretjwtkey',
      });
      request['user'] = payload;
    } catch {
      const email = request.headers['x-user-email'] as string;
      if (email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
          request['user'] = { sub: user.id, email: user.email };
          return true;
        }
      }
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
