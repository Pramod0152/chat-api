import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from 'src/dto/conversation/create-conversation.dto';
import { UpdateConversationDto } from '../dto/conversation/update-conversation.dto';

@Injectable()
export class ConversationDataService {
  constructor(@InjectModel(Conversation) private readonly model: typeof Conversation) {}

  async createConversation(admin_id: number, item: CreateConversationDto) {
    return this.model.create({
      admin_id: admin_id,
      type: item.type,
      group_name: item.group_name ?? null,
      group_image: item.group_image ?? null,
      status: 'Active',
    });
  }

  async findAll() {
    return this.model.findAll({
      include: ['admin', 'participants'],
    });
  }

  async findById(conversation_id: number) {
    return this.model.findOne({
      where: { id: conversation_id },
      include: ['admin', 'participants'],
    });
  }

  async updateConversation(conversation_id: number, item: UpdateConversationDto) {
    const conversation = await this.findById(conversation_id);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const filteredItem = Object.fromEntries(Object.entries(item).filter(([_, value]) => value !== undefined));
    return conversation.update(filteredItem);
  }

  async deleteById(conversation_id: number) {
    return this.model.update(
      {
        deleted_at: new Date(),
      },
      {
        where: { id: conversation_id },
      },
    );
  }
}
