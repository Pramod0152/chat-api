import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { UpdateMessageDto } from 'src/dto/message/update-message.dto';
import { MessageType } from 'src/lib/enums';

@Injectable()
export class MessageDataService {
  constructor(@InjectModel(Message) private readonly model: typeof Message) {}

  async createMessage(user_id: number, item: CreateMessageDto) {
    const message = await this.model.create({
      conversation_id: item.conversation_id,
      user_id,
      content: item.content,
      type: item.type ?? MessageType.Text,
      is_updated: false,
    });
    return this.findById(message.id);
  }

  async findAll(conversation_id: number) {
    return this.model.findAll({
      where: {
        conversation_id,
        deleted_at: null,
      },
      include: ['user'],
      order: [['created_at', 'DESC']],
    });
  }

  async findById(message_id: number) {
    return this.model.findOne({
      where: {
        id: message_id,
        deleted_at: null,
      },
      include: ['user'],
    });
  }

  async updateMessage(message_id: number, item: UpdateMessageDto) {
    const message = await this.findById(message_id);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const filteredItem = Object.fromEntries(Object.entries(item).filter(([_, value]) => value !== undefined));
    if (filteredItem.content !== undefined) {
      filteredItem.is_updated = true;
    }

    return message.update(filteredItem);
  }

  async deleteById(message_id: number) {
    return this.model.update(
      {
        deleted_at: new Date(),
      },
      {
        where: { id: message_id },
      },
    );
  }
}
