import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { Conversation } from 'src/dal/entities/conversation.entity';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { UserDataService } from 'src/dal/user.data.service';
import { CreateConversationDto } from 'src/dto/conversation/create-conversation.dto';
import { ReadConversationDto } from 'src/dto/conversation/read-conversation.dto';
import { UpdateConversationDto } from 'src/dto/conversation/update-conversation.dto';
import { ConversationType, ErrorMessageType } from 'src/lib/enums';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationDataService: ConversationDataService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly userDataService: UserDataService,
    private readonly participantDataService: ParticipantDataService,
  ) {}

  async create(admin_id: number, item: CreateConversationDto) {
    const user = await this.userDataService.findById(admin_id);
    if (!user) {
      throw new NotFoundException(ErrorMessageType.UserNotFound);
    }

    const participant_ids = [...new Set([admin_id, ...(item.participant_ids || [])])];

    for (const user_id of participant_ids) {
      const user = await this.userDataService.findById(user_id);
      if (!user) {
        throw new NotFoundException(`${ErrorMessageType.UserNotFound}: ${user_id}`);
      }
    }

    if (item.type === ConversationType.Private) {
      const additional_participant_ids = participant_ids.filter((user_id) => user_id !== admin_id);
      if (additional_participant_ids.length > 1) {
        throw new BadRequestException(ErrorMessageType.PrivateConversationParticipantLimit);
      }
    }

    const conversation = await this.conversationDataService.createConversation(admin_id, item);

    await this.participantDataService.bulkCreateParticipants(conversation.id, participant_ids);

    return this.mapper.mapAsync(conversation, Conversation, ReadConversationDto);
  }

  async findAll() {
    const conversations = await this.conversationDataService.findAll();
    return this.mapper.mapArrayAsync(conversations, Conversation, ReadConversationDto);
  }

  async findById(conversation_id: number) {
    const conversation = await this.conversationDataService.findById(conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    return this.mapper.map(conversation, Conversation, ReadConversationDto);
  }

  async update(conversation_id: number, item: UpdateConversationDto) {
    const conversation = await this.conversationDataService.findById(conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.conversationDataService.updateConversation(conversation_id, item);
    return {
      message: 'Conversation updated successfully',
    };
  }

  async deleteById(conversation_id: number) {
    const conversation = await this.conversationDataService.findById(conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.conversationDataService.deleteById(conversation_id);
    return {
      message: 'Conversation deleted successfully',
    };
  }
}
