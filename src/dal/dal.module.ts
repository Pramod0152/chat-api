import { Global, Module } from '@nestjs/common';
import { UserDataService } from './user.data.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationDataService } from './conversation.data.service';
import { Message } from './entities/message.entity';
import { MessageDataService } from './message.data.service';
import { Participant } from './entities/participant.entity';
import { ParticipantDataService } from './participant.data.service';
import { UserDeviceDetail } from './entities/user-device-detail.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([User, Conversation, Message, Participant, UserDeviceDetail])],
  providers: [UserDataService, ConversationDataService, MessageDataService, ParticipantDataService],
  exports: [UserDataService, ConversationDataService, MessageDataService, ParticipantDataService],
})
export class DalModule {}
