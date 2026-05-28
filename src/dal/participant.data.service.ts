import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateParticipantDto } from 'src/dto/participant/create-participant.dto';
import { UpdateParticipantDto } from 'src/dto/participant/update-participant.dto';
import { Participant } from './entities/participant.entity';

@Injectable()
export class ParticipantDataService {
  constructor(@InjectModel(Participant) private readonly model: typeof Participant) {}

  async createParticipant(item: CreateParticipantDto) {
    return this.model.create({
      conversation_id: item.conversation_id,
      user_id: item.user_id,
      last_read_message_id: item.last_read_message_id ?? null,
    });
  }

  async bulkCreateParticipants(conversation_id: number, user_ids: number[]) {
    const values = user_ids.map((user_id) => ({
      conversation_id,
      user_id,
      last_read_message_id: null,
    }));
    return this.model.bulkCreate(values);
  }

  async findByConversationId(conversation_id: number) {
    return this.model.findAll({
      where: { conversation_id },
      include: ['user'],
    });
  }

  async findById(participant_id: number) {
    return this.model.findOne({
      where: { id: participant_id },
      include: ['user'],
    });
  }

  async updateParticipant(participant_id: number, item: UpdateParticipantDto) {
    const participant = await this.findById(participant_id);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const filteredItem = Object.fromEntries(Object.entries(item).filter(([_, value]) => value !== undefined));
    return participant.update(filteredItem);
  }

  async deleteById(participant_id: number) {
    return this.model.update(
      {
        deleted_at: new Date(),
      },
      {
        where: { id: participant_id },
      },
    );
  }
}
