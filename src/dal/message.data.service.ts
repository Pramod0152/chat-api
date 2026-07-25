import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { UpdateMessageDto } from 'src/dto/message/update-message.dto';
import { MessageType } from 'src/lib/enums';
import { FilterMessageDto } from 'src/dto/message/filter-message.dto';
import { Op } from 'sequelize';
import { paginate } from 'src/common/pagination/paginate';

@Injectable()
export class MessageDataService {
  constructor(@InjectModel(Message) private readonly model: typeof Message) { }

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

  async findAll(user_id: number, query: FilterMessageDto, order: 'ASC' | 'DESC' = 'DESC') {
    const { limit = 20, cursor } = query;
    const condition: any = {
      conversation_id: query.conversation_id,
      deleted_at: null,
    };

    // Filter summary messages: only show summary messages created by the requesting user
    condition[Op.or] = [
      { type: { [Op.ne]: MessageType.Summary } }, // Show all non-summary messages
      { type: MessageType.Summary, user_id: user_id }, // Show summary messages only if created by the user
    ];

    if (cursor != null) {
      condition.id = { [Op.lt]: cursor };
    }

    const messages = await this.model.findAll({
      where: condition,
      limit: limit + 1,
      order: [
        ['created_at', order],
        ['id', order],
      ],
      include: ['user'],
    });
    return paginate(messages, limit);
  }

  async findForSummary(conversation_id: number, limit: number = 15) {
    const condition: any = {
      conversation_id: conversation_id,
      deleted_at: null,
      type: MessageType.Text, // Only fetch Text type messages for AI summarization
    };

    const messages = await this.model.findAll({
      where: condition,
      limit: limit,
      order: [
        ['created_at', 'DESC'], // Get most recent messages first
        ['id', 'DESC'],
      ],
      include: ['user'],
    });

    // Reverse to get chronological order for the AI
    return messages.reverse();
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
