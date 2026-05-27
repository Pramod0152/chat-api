import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { Conversation } from 'src/dal/entities/conversation.entity';
import { UserDataService } from 'src/dal/user.data.service';
import { CreateConversationDto } from 'src/dto/conversation/create-conversation.dto';
import { ReadConversationDto } from 'src/dto/conversation/read-conversation.dto';
import { UpdateConversationDto } from 'src/dto/conversation/update-conversation.dto';
import { ErrorMessageType } from 'src/lib/enums';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationDataService: ConversationDataService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly userDataService: UserDataService,
  ) {}

  async create(admin_id: number, item: CreateConversationDto) {
    const user = await this.userDataService.findById(admin_id);
    if (!user) {
      throw new NotFoundException(ErrorMessageType.UserNotFound);
    }

    const conversation = await this.conversationDataService.createConversation(admin_id, item);
    return this.mapper.mapAsync(conversation, Conversation, ReadConversationDto);
  }

  async findAll() {
    const conversations = await this.conversationDataService.findAll();
    return this.mapper.mapArrayAsync(conversations, Conversation, ReadConversationDto);
  }

  async findById(id: number) {
    const conversation = await this.conversationDataService.findById(id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    return this.mapper.map(conversation, Conversation, ReadConversationDto);
  }

  async update(id: number, item: UpdateConversationDto) {
    const conversation = await this.conversationDataService.findById(id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.conversationDataService.updateConversation(id, item);
    return {
      message: 'Conversation updated successfully',
    };
  }

  async deleteById(id: number) {
    const conversation = await this.conversationDataService.findById(id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.conversationDataService.deleteById(id);
    return {
      message: 'Conversation deleted successfully',
    };
  }
}
