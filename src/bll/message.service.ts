import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageDataService } from 'src/dal/message.data.service';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { Message } from 'src/dal/entities/message.entity';
import { UserDataService } from 'src/dal/user.data.service';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { ReadMessageDto } from 'src/dto/message/read-message.dto';
import { UpdateMessageDto } from 'src/dto/message/update-message.dto';
import { ErrorMessageType, EventEmitterType } from 'src/lib/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { FilterMessageDto } from 'src/dto/message/filter-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageDataService: MessageDataService,
    private readonly conversationDataService: ConversationDataService,
    private readonly userDataService: UserDataService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly eventEmitter: EventEmitter2,
    private readonly participantDataService: ParticipantDataService,
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
    if (!message) {
      throw new BadRequestException(ErrorMessageType.MessageNotCreated);
    }
    return this.mapper.mapAsync(message, Message, ReadMessageDto);
  }

  async findAll(user_id: number, query: FilterMessageDto) {
    const participant = await this.participantDataService.checkParticipantExists(user_id, query.conversation_id);
    if (!participant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const { data, nextCursor } = await this.messageDataService.findAll(user_id, query);
    const updatedMessages = await this.mapper.mapArrayAsync(data, Message, ReadMessageDto);

    const recentMessage = updatedMessages[0];
    if (recentMessage && participant.last_read_message_id < recentMessage.id) {
      this.eventEmitter.emit(EventEmitterType.UpdateLastMessage, {
        message: recentMessage,
        user_id,
      });
    }

    return {
      data: updatedMessages,
      nextCursor,
    };
  }

  async findById(message_id: number) {
    const message = await this.messageDataService.findById(message_id);
    if (!message) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    return this.mapper.map(message, Message, ReadMessageDto);
  }

  async update(message_id: number, item: UpdateMessageDto) {
    const message = await this.messageDataService.findById(message_id);
    if (!message) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.messageDataService.updateMessage(message_id, item);
    return {
      message: 'Message updated successfully',
    };
  }

  async deleteById(message_id: number) {
    const message = await this.messageDataService.findById(message_id);
    if (!message) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.messageDataService.deleteById(message_id);
    return {
      message: 'Message deleted successfully',
    };
  }
}
