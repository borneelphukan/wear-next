import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Request() req,
    @Body() body: { message: string; conversationHistory?: any[]; weatherData?: any },
  ) {
    const userId = req.user.sub;
    return this.aiService.chat(
      userId,
      body.message,
      body.conversationHistory || [],
      body.weatherData,
    );
  }

  @Post('analyze-apparel')
  async analyzeApparel(@Body() body: { image: string }) {
    return this.aiService.analyzeApparel(body.image);
  }
}
