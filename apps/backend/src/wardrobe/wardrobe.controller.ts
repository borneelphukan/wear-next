import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('wardrobe')
@UseGuards(AuthGuard)
export class WardrobeController {
  constructor(private readonly wardrobeService: WardrobeService) {}

  @Post()
  createItem(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    return this.wardrobeService.createItem(userId, body);
  }

  @Get()
  getItems(@Request() req, @Query() query: any) {
    const userId = req.user.sub;
    return this.wardrobeService.getItems(userId, query);
  }

  @Get(':id')
  getItemById(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.wardrobeService.getItemById(userId, parseInt(id, 10));
  }

  @Put(':id')
  updateItem(@Request() req, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.sub;
    return this.wardrobeService.updateItem(userId, parseInt(id, 10), body);
  }

  @Delete(':id')
  deleteItem(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.wardrobeService.deleteItem(userId, parseInt(id, 10));
  }
}
