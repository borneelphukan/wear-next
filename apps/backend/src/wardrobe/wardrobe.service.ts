import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WardrobeService {
  constructor(private readonly prisma: PrismaService) {}

  async createItem(userId: number, itemData: any) {
    return await this.prisma.wardrobe.create({
      data: {
        userId,
        apparel_name: itemData.apparel_name,
        photo: itemData.photo,
        type: itemData.type,
        material: itemData.material,
        color: itemData.color,
        season: itemData.season,
        event: itemData.event,
      },
    });
  }

  async getItems(userId: number, filters: any) {
    const whereClause: any = { userId };
    
    if (filters.search) {
      whereClause.apparel_name = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.type) {
      whereClause.type = filters.type;
    }
    if (filters.material) {
      whereClause.material = filters.material;
    }
    if (filters.color) {
      whereClause.color = filters.color;
    }
    if (filters.season) {
      whereClause.season = filters.season;
    }

    return await this.prisma.wardrobe.findMany({
      where: whereClause,
      orderBy: { date_added: 'desc' },
    });
  }

  async getItemById(userId: number, id: number) {
    const item = await this.prisma.wardrobe.findFirst({
      where: { id, userId },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async updateItem(userId: number, id: number, itemData: any) {
    const item = await this.prisma.wardrobe.findFirst({
      where: { id, userId },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return await this.prisma.wardrobe.update({
      where: { id },
      data: itemData,
    });
  }

  async deleteItem(userId: number, id: number) {
    const item = await this.prisma.wardrobe.findFirst({
      where: { id, userId },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return await this.prisma.wardrobe.delete({
      where: { id },
    });
  }
}
