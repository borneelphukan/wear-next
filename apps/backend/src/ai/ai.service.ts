import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async chat(
    userId: number,
    message: string,
    conversationHistory: ChatMessage[] = [],
    weatherData?: { temperature: number | null; condition: string; cityName: string },
  ) {
    // Fetch the user's wardrobe items for context
    const wardrobeItems = await this.prisma.wardrobe.findMany({
      where: { userId },
      select: {
        id: true,
        apparel_name: true,
        type: true,
        material: true,
        color: true,
        season: true,
        event: true,
        photo: true,
      },
    });

    const wardrobeSummary =
      wardrobeItems.length > 0
        ? wardrobeItems
            .map(
              (item) =>
                `- ID: ${item.id} | Name: "${item.apparel_name}" | Type: ${item.type} | Material: ${item.material} | Color: ${item.color} | Season: ${item.season}`,
            )
            .join('\n')
        : 'The user has no items in their wardrobe yet.';

    const weatherContext = weatherData
      ? `\nActive Weather at user's location (${weatherData.cityName || 'Unknown'}):\n- Temperature: ${weatherData.temperature !== null ? `${weatherData.temperature}°C` : 'Unknown'}\n- Condition: ${weatherData.condition || 'Unknown'}\n`
      : '';

    const systemPrompt = `You are WearNext AI Stylist — a premium, knowledgeable fashion assistant embedded in a personal wardrobe management app. You help users decide what to wear based on weather, occasion, trends, and their existing wardrobe.

${weatherContext}
Here is the user's current wardrobe inventory:
${wardrobeSummary}

Guidelines:
- Be concise but helpful. Give actionable outfit suggestions.
- When possible, reference items from the user's wardrobe.
- Consider weather, occasion, and current fashion trends.
- If you recommend items the user doesn't own, mention they could add them to their wardrobe.
- Keep responses conversational and stylish. Use fashion terminology naturally.
- Format responses with clear structure when suggesting outfits.
- CRITICAL: You MUST respond with a valid JSON object matching the following structure:
{
  "reply": "Your stylish response message here. You can use markdown bold like **item name** for emphasis.",
  "recommendedItemIds": [comma-separated list of item IDs recommended from the user's wardrobe above. Only include IDs of items that are explicitly in the wardrobe list above.]
}`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 1024,
      temperature: 0.7,
    });

    const rawResponse = completion.choices[0]?.message?.content || '{}';
    
    let reply = 'Sorry, I could not generate a response.';
    let recommendedItems: any[] = [];

    try {
      const parsed = JSON.parse(rawResponse);
      reply = parsed.reply || reply;
      if (parsed.recommendedItemIds && Array.isArray(parsed.recommendedItemIds)) {
        const ids = parsed.recommendedItemIds.map((id: any) => Number(id));
        recommendedItems = wardrobeItems.filter((item) => ids.includes(item.id));
      }
    } catch (err) {
      console.error('Failed to parse AI JSON response:', err);
      reply = rawResponse;
    }

    return {
      reply,
      recommendedItems,
      model: completion.model,
      usage: completion.usage,
    };
  }
}
export default AiService;
