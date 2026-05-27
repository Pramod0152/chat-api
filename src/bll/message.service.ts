import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageDataService } from 'src/dal/message.data.service';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { Message } from 'src/dal/entities/message.entity';
import { UserDataService } from 'src/dal/user.data.service';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { ReadMessageDto } from 'src/dto/message/read-message.dto';
import { UpdateMessageDto } from 'src/dto/message/update-message.dto';
import { ErrorMessageType } from 'src/lib/enums';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageDataService: MessageDataService,
    private readonly conversationDataService: ConversationDataService,
    private readonly userDataService: UserDataService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(user_id: number, item: CreateMessageDto) {
    const user = await this.userDataService.findById(user_id);
    if (!user) {
      throw new NotFoundException(ErrorMessageType.UserNotFound);
    }

    const conversation = await this.conversationDataService.findById(item.conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const message = await this.messageDataService.createMessage(user_id, item);
    return this.mapper.mapAsync(message, Message, ReadMessageDto);
  }

  async findAll(conversation_id?: number) {
    const messages = await this.messageDataService.findAll(conversation_id);
    return this.mapper.mapArrayAsync(messages, Message, ReadMessageDto);
  }

  async findById(id: number) {
    const message = await this.messageDataService.findById(id);
    if (!message) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    return this.mapper.map(message, Message, ReadMessageDto);
  }

  async update(id: number, item: UpdateMessageDto) {
    const message = await this.messageDataService.findById(id);
    if (!message) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.messageDataService.updateMessage(id, item);
    return {
      message: 'Message updated successfully',
    };
  }

  async deleteById(id: number) {
    const message = await this.messageDataService.findById(id);
    if (!message) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.messageDataService.deleteById(id);
    return {
      message: 'Message deleted successfully',
    };
  }
}
