import { Global, Module } from '@nestjs/common';
import { UserDataService } from './user.data.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationDataService } from './conversation.data.service';
import { Message } from './entities/message.entity';
import { MessageDataService } from './message.data.service';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([User, Conversation, Message])],
  providers: [UserDataService, ConversationDataService, MessageDataService],
  exports: [UserDataService, ConversationDataService, MessageDataService],
})
export class DalModule {}
