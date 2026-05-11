import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(userData: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
      },
    });

    const { password: _password, ...result } = user;
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      user: result,
      accessToken,
    };
  }

  async getProfileByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email?.trim()?.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _password, ...result } = user;
    return result;
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _password, ...result } = user;
    return result;
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password: _password, ...userProfile } = user;
    return {
      user: userProfile,
      accessToken,
    };
  }

  async deleteUser(id: number, password: string) {
    if (!password) {
      throw new UnauthorizedException('Password is required to delete your account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true, message: 'Account deleted successfully' };
  }

  async updatePreferences(id: number, prefs: { useCelsius?: boolean, darkMode?: boolean }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(prefs.useCelsius !== undefined && { useCelsius: prefs.useCelsius }),
        ...(prefs.darkMode !== undefined && { darkMode: prefs.darkMode }),
      },
    });

    const { password: _password, ...result } = updatedUser;
    return result;
  }
}
