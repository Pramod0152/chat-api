import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { Participant } from 'src/dal/entities/participant.entity';
import { UserDataService } from 'src/dal/user.data.service';
import { CreateParticipantDto } from 'src/dto/participant/create-participant.dto';
import { ReadParticipantDto } from 'src/dto/participant/read-participant.dto';
import { UpdateParticipantDto } from 'src/dto/participant/update-participant.dto';
import { ConversationType, ErrorMessageType } from 'src/lib/enums';

@Injectable()
export class ParticipantService {
  constructor(
    private readonly participantDataService: ParticipantDataService,
    private readonly conversationDataService: ConversationDataService,
    private readonly userDataService: UserDataService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(item: CreateParticipantDto) {
    const user = await this.userDataService.findById(item.user_id);
    if (!user) {
      throw new NotFoundException(ErrorMessageType.UserNotFound);
    }

    const conversation = await this.conversationDataService.findById(item.conversation_id);
    if (!conversation) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    if (conversation.type === ConversationType.Private) {
      const existingParticipants = await this.participantDataService.findByConversationId(item.conversation_id);
      if (existingParticipants.length >= 2) {
        throw new BadRequestException(ErrorMessageType.PrivateConversationParticipantLimit);
      }
    }

    const participant = await this.participantDataService.createParticipant(item);
    return this.mapper.mapAsync(participant, Participant, ReadParticipantDto);
  }

  async findByConversationId(conversation_id: number) {
    const participants = await this.participantDataService.findByConversationId(conversation_id);
    return this.mapper.mapArrayAsync(participants, Participant, ReadParticipantDto);
  }

  async findById(participant_id: number) {
    const participant = await this.participantDataService.findById(participant_id);
    if (!participant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    return this.mapper.map(participant, Participant, ReadParticipantDto);
  }

  async update(participant_id: number, item: UpdateParticipantDto) {
    const participant = await this.participantDataService.findById(participant_id);
    if (!participant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    const data = await this.participantDataService.updateParticipant(participant_id, item);
    return this.mapper.mapAsync(data, Participant, ReadParticipantDto);
  }

  async deleteById(participant_id: number) {
    const participant = await this.participantDataService.findById(participant_id);
    if (!participant) {
      throw new NotFoundException(ErrorMessageType.NotFound);
    }

    await this.participantDataService.deleteById(participant_id);
    return {
      message: 'Participant deleted successfully',
    };
  }
}
