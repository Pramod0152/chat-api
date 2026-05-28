import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ReadUserDto } from './dto/user/read-user.dto';
import { User } from './dal/entities/user.entity';
import { ReadConversationDto } from './dto/conversation/read-conversation.dto';
import { Conversation } from './dal/entities/conversation.entity';
import { ReadMessageDto } from './dto/message/read-message.dto';
import { Message } from './dal/entities/message.entity';
import { ReadParticipantDto } from './dto/participant/read-participant.dto';
import { Participant } from './dal/entities/participant.entity';

@Injectable()
export class Profile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, User, ReadUserDto);
      createMap(mapper, Conversation, ReadConversationDto);
      createMap(mapper, Message, ReadMessageDto);
      createMap(mapper, Participant, ReadParticipantDto);
    };
  }
}
