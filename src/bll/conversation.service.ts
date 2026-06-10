import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { Conversation } from 'src/dal/entities/conversation.entity';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { UserDataService } from 'src/dal/user.data.service';
import { CreateConversationDto } from 'src/dto/conversation/create-conversation.dto';
import { ReadConversationDto } from 'src/dto/conversation/read-conversation.dto';
import { UpdateConversationDto } from 'src/dto/conversation/update-conversation.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
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

    await this.participantDataService.bulkCreateParticipants(conversation.id, participant_ids, admin_id);

    return this.mapper.mapAsync(conversation, Conversation, ReadConversationDto);
  }

  async findAll(user_id: number, query: PaginationDto) {
    const { data, nextCursor } = await this.conversationDataService.findAll(user_id, query);
    return {
      data: await this.mapper.mapArrayAsync(data, Conversation, ReadConversationDto),
      nextCursor,
    };
  }

  async findById(conversation_id: number) {
    const conversation = await this.conversationDataService.findById(conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    return this.mapper.map(conversation, Conversation, ReadConversationDto);
  }

  async update(id: number, item: UpdateConversationDto, user_id: number) {
    const conversation = await this.conversationDataService.findById(id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    if (conversation.admin_id !== user_id) {
      throw new ForbiddenException('You are not allowed to update this conversation');
    }

    await this.conversationDataService.updateConversation(id, item);
    return {
      message: 'Conversation updated successfully',
    };
  }

  async deleteById(id: number, user_id: number) {
    const conversation = await this.conversationDataService.findById(id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    if (conversation.admin_id !== user_id) {
      throw new ForbiddenException('You are not allowed to delete this conversation');
    }

    await this.conversationDataService.deleteById(id);
    return {
      message: 'Conversation deleted successfully',
    };
  }
}
