import { Module } from '@nestjs/common';
import { WardrobeController } from './wardrobe.controller';
import { WardrobeService } from './wardrobe.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'wearnextsupersecretjwtkey',
    }),
  ],
  controllers: [WardrobeController],
  providers: [WardrobeService]
})
export class WardrobeModule {}
