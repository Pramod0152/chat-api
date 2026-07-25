import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { MessageDataService } from 'src/dal/message.data.service';
import { FilterMessageDto } from 'src/dto/message/filter-message.dto';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { MessageType } from 'src/lib/enums';

@Injectable()
export class AiService {
  private client: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly messageService: MessageDataService,
  ) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async generateSummary(user_id: number, query: FilterMessageDto) {
    // Fetch messages using your Data Access Layer service
    const messages = await this.messageService.findAll(user_id, query, 'ASC');

    if (!messages || !messages.data || messages.data.length === 0) {
      return { summary: 'No messages found to summarize for this conversation.' };
    }

    // Map message content cleanly
    const messageContents = messages.data
      .map((msg) => {
        const senderName = msg.user?.id ? `User ${msg.user.id}` : `User ${msg.user_id}`;
        return `${senderName}: ${msg.content}`;
      })
      .join('\n');

    // Define exactly how the model should behave using systemInstruction
    const systemInstruction = `You are a highly efficient assistant summarizing chats for a busy reader. 
    Your goal is to explain exactly what was discussed and who said what in the simplest terms possible. Do not use flowery or academic language.

    Structure your response using the exact following format:

    ### ⚡ TL;DR
    (A 1-2 sentence quick summary of the bottom line.)

    ### 🗣️ Who Said What
    * **[Insert User Name]:** (1 sentence summary of their main stance or problem)
    * **[Insert User Name]:** (1 sentence summary of their main stance or advice)

    ### 📌 Key Topics Discussed
    * (Bullet point 1 - plain English explanation of a topic)
    * (Bullet point 2 - plain English explanation of a topic)

    ### 🎯 Conclusion / Status
    (How the conversation ended or what the next step is.)`;

    try {
      // Generate summary using the official @google/genai SDK
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `--- Chat History ---\n${messageContents}`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3, // Lowered from 0.7 to keep the output factual, direct, and concise
          maxOutputTokens: 1000, // Sufficient for a concise, bulleted summary
        },
      });

      const summaryText = response.text;

      // Save the summary as a message in the conversation
      const createMessageDto: CreateMessageDto = {
        conversation_id: query.conversation_id,
        content: summaryText,
        type: MessageType.Summary,
      };

      await this.messageService.createMessage(user_id, createMessageDto);

      return {
        summary: summaryText,
      };
    } catch (error) {
      console.error('Error generating AI summary:', error);
      throw new Error('Failed to generate conversation summary.');
    }
  }
}