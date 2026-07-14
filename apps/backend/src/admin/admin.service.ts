import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCanDelete(adminId: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');
    if (admin.role !== 'CEO') {
      throw new ForbiddenException('Only CEO can delete resources');
    }
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalWardrobeItems,
      totalEvents,
      recentUsers,
      recentItems,
      recentEvents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.wardrobe.count(),
      this.prisma.calendarEvent.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      }),
      this.prisma.wardrobe.findMany({
        orderBy: { date_added: 'desc' },
        take: 5,
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.calendarEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
    ]);

    return {
      totalUsers,
      totalWardrobeItems,
      totalEvents,
      recentUsers,
      recentItems,
      recentEvents,
    };
  }

  async getUsers(search?: string, page = 1, limit = 20) {
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firstName: true, lastName: true, email: true,
          phone: true, useCelsius: true, darkMode: true,
          createdAt: true, updatedAt: true,
          _count: { select: { wardrobes: true, calendarEvents: true, devices: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserDetail(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, useCelsius: true, darkMode: true,
        createdAt: true, updatedAt: true,
        wardrobes: { orderBy: { date_added: 'desc' } },
        calendarEvents: { orderBy: { dateKey: 'desc' } },
        devices: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(id: number, adminId: number) {
    await this.assertCanDelete(adminId);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'User deleted' };
  }

  async getAllWardrobeItems(search?: string, page = 1, limit = 20) {
    const where: any = {};
    if (search) {
      where.OR = [
        { apparel_name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { material: { contains: search, mode: 'insensitive' } },
        { color: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.wardrobe.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date_added: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.wardrobe.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getWardrobeStats() {
    const [byType, byMaterial, byColor, bySeason, totalItems] = await Promise.all([
      this.prisma.wardrobe.groupBy({ by: ['type'], _count: true, orderBy: { _count: { type: 'desc' } } }),
      this.prisma.wardrobe.groupBy({ by: ['material'], _count: true, orderBy: { _count: { material: 'desc' } } }),
      this.prisma.wardrobe.groupBy({ by: ['color'], _count: true, orderBy: { _count: { color: 'desc' } } }),
      this.prisma.wardrobe.groupBy({ by: ['season'], _count: true, orderBy: { _count: { season: 'desc' } } }),
      this.prisma.wardrobe.count(),
    ]);
    return { totalItems, byType, byMaterial, byColor, bySeason };
  }

  async getAllEvents(search?: string, page = 1, limit = 20) {
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [events, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateKey: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);
    return { events, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getEventStats() {
    const [byType, totalEvents, usersWithEvents] = await Promise.all([
      this.prisma.calendarEvent.groupBy({ by: ['type'], _count: true, orderBy: { _count: { type: 'desc' } } }),
      this.prisma.calendarEvent.count(),
      this.prisma.calendarEvent.groupBy({ by: ['userId'], _count: true }),
    ]);
    return { totalEvents, uniqueUsers: usersWithEvents.length, byType };
  }

  async deleteWardrobeItem(id: number, adminId: number) {
    await this.assertCanDelete(adminId);
    const item = await this.prisma.wardrobe.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Wardrobe item not found');
    await this.prisma.wardrobe.delete({ where: { id } });
    return { success: true, message: 'Item deleted' };
  }

  async deleteEvent(id: number, adminId: number) {
    await this.assertCanDelete(adminId);
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { success: true, message: 'Event deleted' };
  }

  async deleteAdminAccount(adminId: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');
    if (admin.role === 'CEO') {
      const ceoCount = await this.prisma.admin.count({ where: { role: 'CEO' } });
      if (ceoCount <= 1) {
        throw new ForbiddenException('Cannot delete the only CEO account. Assign another CEO first.');
      }
    }
    await this.prisma.admin.delete({ where: { id: adminId } });
    return { success: true, message: 'Admin account deleted' };
  }

  async updateSettings(adminId: number, data: { darkMode?: boolean; role?: AdminRole }) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    if (data.role && data.role === 'CEO') {
      const existingCeo = await this.prisma.admin.findFirst({ where: { role: 'CEO', id: { not: adminId } } });
      if (existingCeo) {
        throw new ForbiddenException('Only one CEO allowed. Demote the current CEO first.');
      }
    }

    const updated = await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        ...(data.darkMode !== undefined && { darkMode: data.darkMode }),
        ...(data.role !== undefined && { role: data.role }),
      },
    });
    const { password: _password, ...result } = updated;
    return result;
  }
}
