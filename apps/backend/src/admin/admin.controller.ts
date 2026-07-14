import {
  Controller, Get, Delete, Patch, Param, Query, Body, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers(search, Number(page) || 1, Number(limit) || 20);
  }

  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(Number(id));
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  deleteUser(@Param('id') id: string, @Req() req: Request) {
    const adminId = (req as any).user.sub;
    return this.adminService.deleteUser(Number(id), adminId);
  }

  @Get('wardrobe')
  getAllWardrobeItems(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllWardrobeItems(search, Number(page) || 1, Number(limit) || 20);
  }

  @Get('wardrobe/stats')
  getWardrobeStats() {
    return this.adminService.getWardrobeStats();
  }

  @Delete('wardrobe/:id')
  @HttpCode(HttpStatus.OK)
  deleteWardrobeItem(@Param('id') id: string, @Req() req: Request) {
    const adminId = (req as any).user.sub;
    return this.adminService.deleteWardrobeItem(Number(id), adminId);
  }

  @Get('events')
  getAllEvents(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllEvents(search, Number(page) || 1, Number(limit) || 20);
  }

  @Get('events/stats')
  getEventStats() {
    return this.adminService.getEventStats();
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.OK)
  deleteEvent(@Param('id') id: string, @Req() req: Request) {
    const adminId = (req as any).user.sub;
    return this.adminService.deleteEvent(Number(id), adminId);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@Req() req: Request) {
    const adminId = (req as any).user.sub;
    return this.adminService.deleteAdminAccount(adminId);
  }

  @Patch('settings')
  @HttpCode(HttpStatus.OK)
  updateSettings(@Body() body: { darkMode?: boolean; role?: string }, @Req() req: Request) {
    const adminId = (req as any).user.sub;
    return this.adminService.updateSettings(adminId, body as any);
  }
}
