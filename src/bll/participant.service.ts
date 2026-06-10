import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { Participant } from 'src/dal/entities/participant.entity';
import { UserDataService } from 'src/dal/user.data.service';
import { CreateParticipantDto } from 'src/dto/participant/create-participant.dto';
import { ReadParticipantDto } from 'src/dto/participant/read-participant.dto';
import { UpdateParticipantDto } from 'src/dto/participant/update-participant.dto';
import { ConversationType, ErrorMessageType } from 'src/lib/enums';
import { FilterParticipantDto } from 'src/dto/participant/filter-participant.dto';

@Injectable()
export class ParticipantService {
  constructor(
    private readonly participantDataService: ParticipantDataService,
    private readonly conversationDataService: ConversationDataService,
    private readonly userDataService: UserDataService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(item: CreateParticipantDto, user_id: number) {
    for (const user_id of item.user_ids) {
      const user = await this.userDataService.findById(user_id);
      if (!user) {
        throw new NotFoundException(`${ErrorMessageType.UserNotFound}: ${user_id}`);
      }
    }

    const conversation = await this.conversationDataService.findById(item.conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    if (conversation.admin_id !== user_id) {
      throw new ForbiddenException('You are not allowed to add participants to this conversation');
    }

    if (conversation.type === ConversationType.Private) {
      throw new ForbiddenException('You are not allowed to add participants to a one to one conversation');
    }

    const participant = await this.participantDataService.bulkCreateParticipants(item.conversation_id, item.user_ids);
    return this.mapper.mapArrayAsync(participant, Participant, ReadParticipantDto);
  }

  async findByConversationId(query: FilterParticipantDto, user_id: number) {
    const isParticipant = await this.participantDataService.checkParticipantExists(user_id, query.conversation_id);
    if (!isParticipant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const { data, nextCursor } = await this.participantDataService.findByConversationId(query);
    const updatedParticipants = await this.mapper.mapArrayAsync(data, Participant, ReadParticipantDto);

    return {
      data: updatedParticipants,
      nextCursor,
    };
  }

  async findById(participant_id: number) {
    const participant = await this.participantDataService.findById(participant_id);
    if (!participant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    return this.mapper.map(participant, Participant, ReadParticipantDto);
  }

  async update(participant_id: number, item: UpdateParticipantDto, user_id: number) {
    const participant = await this.participantDataService.findById(participant_id);
    if (!participant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const conversation = await this.conversationDataService.findById(participant.conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const isAdmin = await this.participantDataService.isAdmin(participant.conversation_id, user_id);

    if (participant.user_id !== user_id || !isAdmin) {
      throw new ForbiddenException('You are not allowed to update this participant');
    }

    await this.participantDataService.updateParticipant(participant_id, item);
    return {
      message: 'Participant updated successfully',
    };
  }

  async deleteById(id: number, user_id: number) {
    const participant = await this.participantDataService.findById(id);
    if (!participant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const conversation = await this.conversationDataService.findById(participant.conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const isAdmin = await this.participantDataService.isAdmin(participant.conversation_id, user_id);

    if (participant.user_id === user_id || isAdmin) {
      await this.participantDataService.deleteById(id);

      return {
        message: 'Participant deleted successfully',
      };
    } else {
      throw new ForbiddenException('You are not allowed to delete this participant');
    }
  }
}
