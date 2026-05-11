import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(userId: number, eventData: any) {
    return await this.prisma.calendarEvent.create({
      data: {
        userId,
        title: eventData.title,
        type: eventData.type,
        time: eventData.time,
        from: eventData.from,
        to: eventData.to,
        dateKey: eventData.dateKey,
      },
    });
  }

  async getEvents(userId: number, query: any) {
    const whereClause: any = { userId };
    
    if (query.dateKey) {
      whereClause.dateKey = query.dateKey;
    }

    return await this.prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { from: 'asc' },
    });
  }

  async updateEvent(userId: number, id: number, eventData: any) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, userId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        title: eventData.title,
        type: eventData.type,
        time: eventData.time,
        from: eventData.from,
        to: eventData.to,
        dateKey: eventData.dateKey,
      },
    });
  }

  async deleteEvent(userId: number, id: number) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, userId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return await this.prisma.calendarEvent.delete({
      where: { id },
    });
  }
}
