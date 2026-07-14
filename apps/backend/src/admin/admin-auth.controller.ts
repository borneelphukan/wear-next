import {
  Controller, Post, Body, HttpCode, HttpStatus,
  ConflictException, UnauthorizedException, InternalServerErrorException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('admin/auth')
@Throttle({ default: { limit: 5, ttl: 60000 } })
export class AdminAuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: { firstName: string; lastName: string; email: string; password: string }) {
    try {
      const existing = await this.prisma.admin.findUnique({ where: { email: body.email } });
      if (existing) {
        throw new ConflictException('Admin with this email already exists');
      }

      const existingCount = await this.prisma.admin.count();
      const role = existingCount === 0 ? 'CEO' : 'PROJECT_MANAGER';

      const hashedPassword = await bcrypt.hash(body.password, 10);
      const admin = await this.prisma.admin.create({
        data: {
          email: body.email,
          password: hashedPassword,
          firstName: body.firstName || '',
          lastName: body.lastName || '',
          role,
        },
      });

      const { password: _password, ...result } = admin;
      const payload = { sub: admin.id, email: admin.email, role: admin.role };
      const accessToken = await this.jwtService.signAsync(payload);
      return { user: result, accessToken };
    } catch (e: any) {
      if (e instanceof ConflictException || e instanceof UnauthorizedException) {
        throw e;
      }
      throw new InternalServerErrorException(e?.message || 'Registration failed');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    try {
      const admin = await this.prisma.admin.findUnique({ where: { email: body.email } });
      if (!admin) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isValid = await bcrypt.compare(body.password, admin.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const { password: _password, ...result } = admin;
      const payload = { sub: admin.id, email: admin.email, role: admin.role };
      const accessToken = await this.jwtService.signAsync(payload);
      return { user: result, accessToken };
    } catch (e: any) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new InternalServerErrorException(e?.message || 'Login failed');
    }
  }
}
