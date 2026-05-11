import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query, Put } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('calendar-events')
@UseGuards(AuthGuard)
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  createEvent(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    return this.calendarEventsService.createEvent(userId, body);
  }

  @Get()
  getEvents(@Request() req, @Query() query: any) {
    const userId = req.user.sub;
    return this.calendarEventsService.getEvents(userId, query);
  }

  @Put(':id')
  updateEvent(@Request() req, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.sub;
    return this.calendarEventsService.updateEvent(userId, parseInt(id, 10), body);
  }

  @Delete(':id')
  deleteEvent(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.calendarEventsService.deleteEvent(userId, parseInt(id, 10));
  }
}
