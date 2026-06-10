import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateParticipantDto } from 'src/dto/participant/create-participant.dto';
import { UpdateParticipantDto } from 'src/dto/participant/update-participant.dto';
import { Participant } from './entities/participant.entity';
import { FilterParticipantDto } from 'src/dto/participant/filter-participant.dto';
import { Op } from 'sequelize';
import { paginate } from 'src/common/pagination/paginate';

@Injectable()
export class ParticipantDataService {
  constructor(@InjectModel(Participant) private readonly model: typeof Participant) {}

  async bulkCreateParticipants(conversation_id: number, user_ids: number[], admin_id?: number) {
    const values = user_ids.map((user_id) => ({
      conversation_id,
      user_id,
      last_read_message_id: null,
      is_admin: admin_id != null && user_id === admin_id,
    }));
    return this.model.bulkCreate(values);
  }

  async findByConversationId(query: FilterParticipantDto) {
    const { limit = 10, cursor } = query;

    const condition: any = {
      conversation_id: query.conversation_id,
      deleted_at: null,
    };

    if (cursor != null) {
      condition.id = { [Op.lt]: cursor };
    }

    const participants = await this.model.findAll({
      where: condition,
      limit: limit + 1,
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
      include: ['user'],
    });

    return paginate(participants, limit);
  }

  async findAllParticipants(conversation_id: number) {
    return this.model.findAll({
      where: {
        conversation_id,
        deleted_at: null,
      },
      include: ['user'],
    });
  }

  async findById(participant_id: number) {
    return this.model.findOne({
      where: {
        id: participant_id,
        deleted_at: null,
      },
      include: ['user'],
    });
  }

  async isAdmin(conversation_id: number, user_id: number) {
    return this.model.findOne({
      where: {
        conversation_id,
        user_id,
        is_admin: true,
        deleted_at: null,
      },
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
    return this.model.destroy({
      where: { id: participant_id },
    });
  }

  async updateLastReadMessageId(user_id: number, conversation_id: number, last_read_message_id: number) {
    return this.model.update(
      {
        last_read_message_id,
      },
      {
        where: {
          user_id,
          conversation_id,
        },
      },
    );
  }

  async checkParticipantExists(user_id: number, conversation_id: number) {
    return this.model.findOne({
      where: {
        user_id,
        conversation_id,
        deleted_at: null,
      },
    });
  }
}
