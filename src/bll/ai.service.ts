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
    // Fetch messages using the dedicated AI summary method (only Text type, recent 15+ messages)
    const messages = await this.messageService.findForSummary(query.conversation_id, 15);

    if (!messages || messages.length === 0) {
      return { summary: 'No messages found to summarize for this conversation.' };
    }

    // 1. Identify the other user's name dynamically for the prompt context
    const otherUserMsg = messages.find(
      (msg) => (msg.user?.id || msg.user_id) !== user_id
    );
    const otherUserName = otherUserMsg?.user?.username || 'The other person';

    // 2. Map message content dynamically to "You" and "Username"
    const messageContents = messages
      .map((msg) => {
        const senderId = msg.user?.id || msg.user_id;
        const isRequester = senderId === user_id;

        // Label the requester as 'You', otherwise use their username
        const senderName = isRequester ? 'You' : (msg.user?.username || `User ${senderId}`);
        return `${senderName}: ${msg.content}`;
      })
      .join('\n');

    console.log('messageContents', messageContents);

    // 3. Define the conversational, direct-to-user prompt
    const systemInstruction = `You are a helpful assistant getting a user up to speed on their chat.
    Your goal is to give a very simple, plain-English summary of what is going on so they know how to reply next.
    Talk directly to the user using "You". Refer to the other person as "${otherUserName}".
    Do NOT use formal, dramatic, or academic language. Keep it casual and highly practical.

    Structure your response using exactly this format:

    ### 📝 The Context
    (1-2 simple sentences explaining what you both were talking about.)

    ### 🗣️ What ${otherUserName} Is Saying
    (A brief, simple explanation of their main point. What do they mean?)

    ### 📍 Right Now
    (What exactly is happening at the very end of the chat to help you figure out what to reply—e.g., "They just said hi, waiting for your reply.")`;

    try {
      // Generate summary using the official @google/genai SDK
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `--- Chat History ---\n${messageContents}`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2, // Very low temperature for simple, factual summaries
          maxOutputTokens: 2000,
        },
      });

      const summaryText = response.text;

      // 4. Save the summary as a message in the conversation
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