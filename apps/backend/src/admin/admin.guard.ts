import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.sub) {
      throw new ForbiddenException('Access denied');
    }
    const admin = await this.prisma.admin.findUnique({
      where: { id: user.sub },
    });
    if (!admin) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
